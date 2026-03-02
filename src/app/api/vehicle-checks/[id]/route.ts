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

    const vehicleCheck = await db.vehicleCheck.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (!vehicleCheck) {
      return NextResponse.json({ error: 'Vehicle check not found' }, { status: 404 });
    }

    return NextResponse.json(vehicleCheck);
  } catch (error) {
    console.error('Get vehicle check error:', error);
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

    const existingCheck = await db.vehicleCheck.findUnique({
      where: { id },
    });

    if (!existingCheck) {
      return NextResponse.json({ error: 'Vehicle check not found' }, { status: 404 });
    }

    // Only allow updates if check is still CHECKED OUT
    if (existingCheck.status !== 'CHECKED OUT') {
      return NextResponse.json(
        { error: 'Cannot update a checked-in record' },
        { status: 400 }
      );
    }

    const vehicleCheck = await db.vehicleCheck.update({
      where: { id },
      data: {
        checkOutOdometer: data.checkOutOdometer !== undefined ? parseFloat(data.checkOutOdometer) : undefined,
        purpose: data.purpose,
        destination: data.destination,
        expectedReturn: data.expectedReturn ? new Date(data.expectedReturn) : undefined,
        notes: data.notes,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return NextResponse.json(vehicleCheck);
  } catch (error) {
    console.error('Update vehicle check error:', error);
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

    const existingCheck = await db.vehicleCheck.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!existingCheck) {
      return NextResponse.json({ error: 'Vehicle check not found' }, { status: 404 });
    }

    // If the check is still CHECKED OUT, we need to update the vehicle status back to AVAILABLE
    if (existingCheck.status === 'CHECKED OUT') {
      await db.$transaction(async (tx) => {
        await tx.vehicleCheck.delete({ where: { id } });
        await tx.vehicle.update({
          where: { id: existingCheck.vehicleId },
          data: { status: 'AVAILABLE' },
        });
      });
    } else {
      await db.vehicleCheck.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vehicle check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
