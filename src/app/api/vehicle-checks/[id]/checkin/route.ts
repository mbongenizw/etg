import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
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

    // Get existing vehicle check
    const existingCheck = await db.vehicleCheck.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!existingCheck) {
      return NextResponse.json({ error: 'Vehicle check not found' }, { status: 404 });
    }

    // Verify the check is still CHECKED OUT
    if (existingCheck.status !== 'CHECKED OUT') {
      return NextResponse.json(
        { error: 'This vehicle has already been checked in' },
        { status: 400 }
      );
    }

    // Calculate distance traveled
    const checkInOdometer = parseFloat(data.checkInOdometer);
    const distanceTraveled = checkInOdometer - existingCheck.checkOutOdometer;

    if (distanceTraveled < 0) {
      return NextResponse.json(
        { error: 'Check-in odometer cannot be less than check-out odometer' },
        { status: 400 }
      );
    }

    // Determine new vehicle status
    // If issues reported, set to MAINTENANCE, otherwise AVAILABLE
    const hasIssues = data.issues && data.issues.trim().length > 0;
    const newVehicleStatus = hasIssues ? 'MAINTENANCE' : 'AVAILABLE';

    // Update vehicle check and vehicle in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update the vehicle check record
      const updatedCheck = await tx.vehicleCheck.update({
        where: { id },
        data: {
          checkInTime: new Date(),
          checkInOdometer,
          distanceTraveled,
          fuelLevel: data.fuelLevel || null,
          condition: data.condition || null,
          issues: data.issues || null,
          notes: data.notes || null,
          status: 'CHECKED IN',
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });

      // Update the vehicle status and mileage
      await tx.vehicle.update({
        where: { id: existingCheck.vehicleId },
        data: {
          status: newVehicleStatus,
          mileage: checkInOdometer,
        },
      });

      return updatedCheck;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Check-in vehicle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
