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
    const status = searchParams.get('status');
    const tripType = searchParams.get('tripType');

    // Build where clause
    const where: any = {};

    // Date filter
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    // Vehicle filter
    if (vehicleIds && vehicleIds !== 'all') {
      where.vehicleId = { in: vehicleIds.split(',') };
    }

    // Driver filter
    if (driverIds && driverIds !== 'all') {
      where.driverId = { in: driverIds.split(',') };
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Trip type filter
    if (tripType && tripType !== 'all') {
      where.tripType = tripType;
    }

    const trips = await db.trip.findMany({
      where,
      include: {
        vehicle: { 
          select: { 
            id: true,
            plateNumber: true, 
            make: true, 
            model: true 
          } 
        },
        driver: { 
          select: { 
            id: true,
            name: true, 
            employeeId: true 
          } 
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // Calculate summary statistics
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
    const inProgressTrips = trips.filter(t => t.status === 'IN PROGRESS').length;
    const scheduledTrips = trips.filter(t => t.status === 'SCHEDULED').length;
    const cancelledTrips = trips.filter(t => t.status === 'CANCELLED').length;

    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const avgDistance = completedTrips > 0 
      ? trips.filter(t => t.status === 'COMPLETED').reduce((sum, trip) => sum + (trip.distance || 0), 0) / completedTrips 
      : 0;

    // Calculate average duration for completed trips
    const completedTripsWithDuration = trips.filter(t => t.status === 'COMPLETED' && t.startTime && t.endTime);
    const avgDuration = completedTripsWithDuration.length > 0
      ? completedTripsWithDuration.reduce((sum, trip) => {
          const duration = (new Date(trip.endTime!).getTime() - new Date(trip.startTime).getTime()) / (1000 * 60); // in minutes
          return sum + duration;
        }, 0) / completedTripsWithDuration.length
      : 0;

    // Trips by type
    const tripsByType = trips.reduce((acc, trip) => {
      acc[trip.tripType] = (acc[trip.tripType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trips by status
    const tripsByStatus = {
      COMPLETED: completedTrips,
      'IN PROGRESS': inProgressTrips,
      SCHEDULED: scheduledTrips,
      CANCELLED: cancelledTrips,
    };

    // Trips by vehicle
    const tripsByVehicle = trips.reduce((acc, trip) => {
      const key = trip.vehicle?.plateNumber || 'Unknown';
      if (!acc[key]) {
        acc[key] = { count: 0, distance: 0 };
      }
      acc[key].count += 1;
      acc[key].distance += trip.distance || 0;
      return acc;
    }, {} as Record<string, { count: number; distance: number }>);

    // Trips by driver
    const tripsByDriver = trips.reduce((acc, trip) => {
      const key = trip.driver?.name || 'Unknown';
      if (!acc[key]) {
        acc[key] = { count: 0, distance: 0 };
      }
      acc[key].count += 1;
      acc[key].distance += trip.distance || 0;
      return acc;
    }, {} as Record<string, { count: number; distance: number }>);

    return NextResponse.json({
      trips,
      summary: {
        totalTrips,
        completedTrips,
        inProgressTrips,
        scheduledTrips,
        cancelledTrips,
        totalDistance,
        avgDistance,
        avgDuration,
        tripsByType,
        tripsByStatus,
        tripsByVehicle,
        tripsByDriver,
      },
    });
  } catch (error) {
    console.error('Get trip reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
