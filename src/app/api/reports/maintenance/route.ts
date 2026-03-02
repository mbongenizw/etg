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
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Build where clause
    const where: any = {};

    // Date filter
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate);
      }
    }

    // Vehicle filter
    if (vehicleIds && vehicleIds !== 'all') {
      where.vehicleId = { in: vehicleIds.split(',') };
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    const maintenance = await db.maintenance.findMany({
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
      },
      orderBy: { startDate: 'desc' },
    });

    // Calculate summary statistics
    const totalMaintenance = maintenance.length;
    const scheduledMaintenance = maintenance.filter(m => m.status === 'SCHEDULED').length;
    const inProgressMaintenance = maintenance.filter(m => m.status === 'IN PROGRESS').length;
    const completedMaintenance = maintenance.filter(m => m.status === 'COMPLETED').length;
    const cancelledMaintenance = maintenance.filter(m => m.status === 'CANCELLED').length;

    // Maintenance by type
    const maintenanceByType = maintenance.reduce((acc, m) => {
      if (!acc[m.type]) {
        acc[m.type] = { count: 0, completed: 0 };
      }
      acc[m.type].count += 1;
      if (m.status === 'COMPLETED') {
        acc[m.type].completed += 1;
      }
      return acc;
    }, {} as Record<string, { count: number; completed: number }>);

    // Maintenance by status
    const maintenanceByStatus = {
      SCHEDULED: scheduledMaintenance,
      'IN PROGRESS': inProgressMaintenance,
      COMPLETED: completedMaintenance,
      CANCELLED: cancelledMaintenance,
    };

    // Maintenance by priority
    const maintenanceByPriority = maintenance.reduce((acc, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Maintenance by vehicle
    const maintenanceByVehicle = maintenance.reduce((acc, m) => {
      const key = m.vehicle?.plateNumber || 'Unknown';
      if (!acc[key]) {
        acc[key] = { count: 0, types: {} };
      }
      acc[key].count += 1;
      acc[key].types[m.type] = (acc[key].types[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, { count: number; types: Record<string, number> }>);

    // Average duration for completed maintenance
    const completedWithDuration = maintenance.filter(m => m.status === 'COMPLETED' && m.startDate && m.endDate);
    const avgDuration = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, m) => {
          const duration = (new Date(m.endDate!).getTime() - new Date(m.startDate).getTime()) / (1000 * 60 * 60); // in hours
          return sum + duration;
        }, 0) / completedWithDuration.length
      : 0;

    return NextResponse.json({
      maintenance,
      summary: {
        totalMaintenance,
        scheduledMaintenance,
        inProgressMaintenance,
        completedMaintenance,
        cancelledMaintenance,
        maintenanceByType,
        maintenanceByStatus,
        maintenanceByPriority,
        maintenanceByVehicle,
        avgDuration,
      },
    });
  } catch (error) {
    console.error('Get maintenance reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
