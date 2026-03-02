import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const fuelType = searchParams.get('fuelType');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vehicleId && vehicleId !== 'all') {
      where.vehicleId = vehicleId;
    }

    if (fuelType && fuelType !== 'all') {
      where.fuelType = fuelType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { station: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { vehicle: { plateNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get total count for pagination
    const total = await db.fuelRecord.count({ where });

    const fuelRecords = await db.fuelRecord.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            make: true,
            model: true,
            fuelType: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    });

    // Get summary stats
    const stats = await db.fuelRecord.aggregate({
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    // Get average fuel per vehicle
    const vehicleFuelStats = await db.fuelRecord.groupBy({
      by: ['vehicleId'],
      _sum: {
        quantity: true,
      },
    });

    const vehicleCount = await db.vehicle.count();
    const avgFuelPerVehicle = vehicleCount > 0 && stats._sum.quantity
      ? stats._sum.quantity / vehicleCount
      : 0;

    return NextResponse.json({
      data: fuelRecords,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalFuel: stats._sum.quantity || 0,
        totalRecords: stats._count.id,
        avgFuelPerVehicle: Math.round(avgFuelPerVehicle * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get fuel records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const fuelRecord = await db.fuelRecord.create({
      data: {
        vehicleId: data.vehicleId,
        date: new Date(data.date),
        fuelType: data.fuelType,
        quantity: parseFloat(data.quantity),
        odometer: parseFloat(data.odometer),
        station: data.station || null,
        receiptNumber: data.receiptNumber || null,
        notes: data.notes || null,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            make: true,
            model: true,
          },
        },
      },
    });

    // Update vehicle mileage if the odometer is higher
    const vehicle = await db.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { mileage: true },
    });

    if (vehicle && parseFloat(data.odometer) > vehicle.mileage) {
      await db.vehicle.update({
        where: { id: data.vehicleId },
        data: { mileage: parseFloat(data.odometer) },
      });
    }

    return NextResponse.json(fuelRecord);
  } catch (error) {
    console.error('Create fuel record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
