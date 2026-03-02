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
    const vehicleId = searchParams.get('vehicleId');
    const driverId = searchParams.get('driverId');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (vehicleId && vehicleId !== 'all') {
      where.vehicleId = vehicleId;
    }

    if (driverId && driverId !== 'all') {
      where.driverId = driverId;
    }

    if (search) {
      where.OR = [
        { origin: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    const trips = await db.trip.findMany({
      where,
      include: {
        vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
        driver: { select: { id: true, name: true, employeeId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
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

    // Calculate distance if end odometer is provided
    let distance = null;
    if (data.endOdometer) {
      distance = parseFloat(data.endOdometer) - parseFloat(data.startOdometer);
    }

    const trip = await db.trip.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        tripType: data.tripType,
        origin: data.origin,
        destination: data.destination,
        startOdometer: parseFloat(data.startOdometer),
        endOdometer: data.endOdometer ? parseFloat(data.endOdometer) : null,
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        endTime: data.endTime ? new Date(data.endTime) : null,
        distance,
        purpose: data.purpose || null,
        status: data.status || 'SCHEDULED',
        notes: data.notes || null,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // Update vehicle status if trip is in progress
    if (data.status === 'IN PROGRESS') {
      await db.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'IN USE' },
      });
    }

    // Update vehicle mileage if trip is completed
    if (data.status === 'COMPLETED' && data.endOdometer) {
      await db.vehicle.update({
        where: { id: data.vehicleId },
        data: { 
          mileage: parseFloat(data.endOdometer),
          status: 'AVAILABLE',
        },
      });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
