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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.vehicleType = type;
    }

    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await db.vehicle.findMany({
      where,
      include: {
        drivers: {
          where: { status: 'ACTIVE' },
          select: { id: true, name: true, employeeId: true },
        },
        _count: {
          select: { trips: true, maintenance: true, fuelRecords: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
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

    // Check if plate number already exists
    const existing = await db.vehicle.findUnique({
      where: { plateNumber: data.plateNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Plate number already exists' },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.create({
      data: {
        plateNumber: data.plateNumber,
        make: data.make,
        model: data.model,
        year: parseInt(data.year),
        color: data.color,
        vehicleType: data.vehicleType,
        fuelType: data.fuelType,
        status: data.status || 'AVAILABLE',
        mileage: parseFloat(data.mileage) || 0,
        capacity: data.capacity ? parseFloat(data.capacity) : null,
        registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : null,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : null,
        imageUrl: data.imageUrl || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
