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
        { destination: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
        { vehicle: { plateNumber: { contains: search, mode: 'insensitive' } } },
        { driver: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const vehicleChecks = await db.vehicleCheck.findMany({
      where,
      include: {
        vehicle: { 
          select: { 
            id: true, 
            plateNumber: true, 
            make: true, 
            model: true,
            mileage: true,
          } 
        },
        driver: { 
          select: { 
            id: true, 
            name: true, 
            employeeId: true,
            phone: true,
          } 
        },
      },
      orderBy: { checkOutTime: 'desc' },
    });

    return NextResponse.json(vehicleChecks);
  } catch (error) {
    console.error('Get vehicle checks error:', error);
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

    // Verify vehicle is available
    const vehicle = await db.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    if (vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Vehicle is not available for check-out' },
        { status: 400 }
      );
    }

    // Verify driver is active
    const driver = await db.driver.findUnique({
      where: { id: data.driverId },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    if (driver.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Driver is not active' },
        { status: 400 }
      );
    }

    // Create vehicle check and update vehicle status in a transaction
    const vehicleCheck = await db.$transaction(async (tx) => {
      const check = await tx.vehicleCheck.create({
        data: {
          vehicleId: data.vehicleId,
          driverId: data.driverId,
          checkOutTime: new Date(),
          checkOutOdometer: parseFloat(data.checkOutOdometer),
          purpose: data.purpose || null,
          destination: data.destination || null,
          expectedReturn: data.expectedReturn ? new Date(data.expectedReturn) : null,
          notes: data.notes || null,
          status: 'CHECKED OUT',
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });

      // Update vehicle status to IN USE
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'IN USE' },
      });

      return check;
    });

    return NextResponse.json(vehicleCheck);
  } catch (error) {
    console.error('Create vehicle check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
