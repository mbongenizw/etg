import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const trip = await db.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Calculate distance if end odometer is provided
    let distance: number | undefined = undefined;
    if (data.endOdometer && data.startOdometer) {
      distance = parseFloat(data.endOdometer) - parseFloat(data.startOdometer);
    }

    const trip = await db.trip.update({
      where: { id },
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        tripType: data.tripType,
        origin: data.origin,
        destination: data.destination,
        startOdometer: data.startOdometer ? parseFloat(data.startOdometer) : undefined,
        endOdometer: data.endOdometer !== undefined ? parseFloat(data.endOdometer) : undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        distance,
        purpose: data.purpose,
        status: data.status,
        notes: data.notes,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // Update vehicle status if trip status changes
    if (data.status === 'IN PROGRESS') {
      await db.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'IN USE' },
      });
    } else if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
      await db.vehicle.update({
        where: { id: trip.vehicleId },
        data: { 
          status: 'AVAILABLE',
          mileage: data.endOdometer ? parseFloat(data.endOdometer) : undefined,
        },
      });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Update trip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.trip.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete trip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
