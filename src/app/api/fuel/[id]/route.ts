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

    const fuelRecord = await db.fuelRecord.findUnique({
      where: { id },
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
    });

    if (!fuelRecord) {
      return NextResponse.json({ error: 'Fuel record not found' }, { status: 404 });
    }

    return NextResponse.json(fuelRecord);
  } catch (error) {
    console.error('Get fuel record error:', error);
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

    const fuelRecord = await db.fuelRecord.update({
      where: { id },
      data: {
        vehicleId: data.vehicleId,
        date: data.date ? new Date(data.date) : undefined,
        fuelType: data.fuelType,
        quantity: data.quantity !== undefined ? parseFloat(data.quantity) : undefined,
        odometer: data.odometer !== undefined ? parseFloat(data.odometer) : undefined,
        station: data.station !== undefined ? data.station || null : undefined,
        receiptNumber: data.receiptNumber !== undefined ? data.receiptNumber || null : undefined,
        notes: data.notes !== undefined ? data.notes || null : undefined,
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
    if (data.odometer) {
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
    }

    return NextResponse.json(fuelRecord);
  } catch (error) {
    console.error('Update fuel record error:', error);
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

    await db.fuelRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete fuel record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
