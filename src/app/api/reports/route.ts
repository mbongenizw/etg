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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vehicleIds = searchParams.get('vehicleIds');
    const driverIds = searchParams.get('driverIds');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Build vehicle filter
    const vehicleFilter = vehicleIds && vehicleIds !== 'all' 
      ? { in: vehicleIds.split(',') } 
      : undefined;

    // Build driver filter
    const driverFilter = driverIds && driverIds !== 'all'
      ? { in: driverIds.split(',') }
      : undefined;

    // Get vehicles and drivers for filter dropdowns
    const [vehicles, drivers] = await Promise.all([
      db.vehicle.findMany({
        select: { id: true, plateNumber: true, make: true, model: true },
        orderBy: { plateNumber: 'asc' },
      }),
      db.driver.findMany({
        select: { id: true, name: true, employeeId: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Get trips summary
    const tripsWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      tripsWhere.startTime = dateFilter;
    }
    if (vehicleFilter) {
      tripsWhere.vehicleId = vehicleFilter;
    }
    if (driverFilter) {
      tripsWhere.driverId = driverFilter;
    }

    const trips = await db.trip.findMany({
      where: tripsWhere,
      include: {
        vehicle: { select: { plateNumber: true, make: true, model: true } },
        driver: { select: { name: true, employeeId: true } },
      },
    });

    // Get maintenance summary
    const maintenanceWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      maintenanceWhere.startDate = dateFilter;
    }
    if (vehicleFilter) {
      maintenanceWhere.vehicleId = vehicleFilter;
    }

    const maintenance = await db.maintenance.findMany({
      where: maintenanceWhere,
      include: {
        vehicle: { select: { plateNumber: true, make: true, model: true } },
      },
    });

    // Get fuel records summary
    const fuelWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      fuelWhere.date = dateFilter;
    }
    if (vehicleFilter) {
      fuelWhere.vehicleId = vehicleFilter;
    }

    const fuelRecords = await db.fuelRecord.findMany({
      where: fuelWhere,
      include: {
        vehicle: { select: { plateNumber: true, make: true, model: true, fuelType: true } },
      },
    });

    // Calculate summaries
    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const avgDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;

    const tripsByStatus = trips.reduce((acc, trip) => {
      acc[trip.status] = (acc[trip.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tripsByType = trips.reduce((acc, trip) => {
      acc[trip.tripType] = (acc[trip.tripType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Maintenance summaries
    const maintenanceByType = maintenance.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maintenanceByStatus = maintenance.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Fuel summaries
    const totalFuel = fuelRecords.reduce((sum, record) => sum + record.quantity, 0);
    const fuelByType = fuelRecords.reduce((acc, record) => {
      acc[record.fuelType] = (acc[record.fuelType] || 0) + record.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Average fuel per vehicle
    const fuelByVehicle = fuelRecords.reduce((acc, record) => {
      if (!acc[record.vehicleId]) {
        acc[record.vehicleId] = { total: 0, count: 0 };
      }
      acc[record.vehicleId].total += record.quantity;
      acc[record.vehicleId].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const avgFuelPerVehicle = Object.keys(fuelByVehicle).length > 0
      ? Object.values(fuelByVehicle).reduce((sum, v) => sum + v.total, 0) / Object.keys(fuelByVehicle).length
      : 0;

    return NextResponse.json({
      vehicles,
      drivers,
      summary: {
        trips: {
          total: totalTrips,
          totalDistance,
          avgDistance,
          byStatus: tripsByStatus,
          byType: tripsByType,
        },
        maintenance: {
          total: maintenance.length,
          byType: maintenanceByType,
          byStatus: maintenanceByStatus,
        },
        fuel: {
          totalFuel,
          avgFuelPerVehicle,
          byType: fuelByType,
        },
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
