import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total vehicles
    const totalVehicles = await db.vehicle.count();

    // Get active drivers
    const activeDrivers = await db.driver.count({
      where: { status: 'ACTIVE' },
    });

    // Get total trips
    const totalTrips = await db.trip.count();

    // Get pending maintenance
    const pendingMaintenance = await db.maintenance.count({
      where: {
        status: { in: ['SCHEDULED', 'IN PROGRESS'] },
      },
    });

    // Get vehicle status distribution
    const vehicles = await db.vehicle.findMany({
      select: { status: true },
    });

    const statusCounts: Record<string, number> = {
      AVAILABLE: 0,
      'IN USE': 0,
      MAINTENANCE: 0,
      RETIRED: 0,
    };

    vehicles.forEach((v) => {
      if (statusCounts[v.status] !== undefined) {
        statusCounts[v.status]++;
      }
    });

    const vehicleStatusDistribution = [
      { name: 'Available', value: statusCounts['AVAILABLE'], color: '#22c55e' },
      { name: 'In Use', value: statusCounts['IN USE'], color: '#f59e0b' },
      { name: 'Maintenance', value: statusCounts['MAINTENANCE'], color: '#eab308' },
      { name: 'Retired', value: statusCounts['RETIRED'], color: '#ef4444' },
    ].filter((item) => item.value > 0);

    // Get recent trips
    const recentTrips = await db.trip.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { plateNumber: true } },
        driver: { select: { name: true } },
      },
    });

    // Get upcoming maintenance
    const upcomingMaintenance = await db.maintenance.findMany({
      take: 5,
      where: {
        status: 'SCHEDULED',
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      include: {
        vehicle: { select: { plateNumber: true } },
      },
    });

    return NextResponse.json({
      totalVehicles,
      activeDrivers,
      totalTrips,
      pendingMaintenance,
      vehicleStatusDistribution,
      recentTrips,
      upcomingMaintenance,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
