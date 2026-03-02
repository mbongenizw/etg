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

    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        drivers: {
          select: { id: true, name: true, employeeId: true, phone: true },
        },
        trips: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            driver: { select: { name: true } },
          },
        },
        maintenance: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        fuelRecords: {
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
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

    if (data.plateNumber) {
      const existing = await db.vehicle.findFirst({
        where: {
          plateNumber: data.plateNumber,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Plate number already exists' },
          { status: 400 }
        );
      }
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        plateNumber: data.plateNumber,
        make: data.make,
        model: data.model,
        year: data.year ? parseInt(data.year) : undefined,
        color: data.color,
        vehicleType: data.vehicleType,
        fuelType: data.fuelType,
        status: data.status,
        mileage: data.mileage !== undefined ? parseFloat(data.mileage) : undefined,
        capacity: data.capacity !== undefined ? (data.capacity ? parseFloat(data.capacity) : null) : undefined,
        registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : null,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : null,
        imageUrl: data.imageUrl,
        notes: data.notes,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
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

    await db.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
