import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending/overdue reminders
    const pendingReminders = await db.reminder.count({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
      },
    });

    // Get overdue reminders
    const overdueReminders = await db.reminder.count({
      where: {
        status: 'OVERDUE',
      },
    });

    // Get open incidents
    const openIncidents = await db.incident.count({
      where: {
        status: { in: ['OPEN', 'IN PROGRESS'] },
      },
    });

    // Get vehicles in maintenance
    const vehiclesInMaintenance = await db.vehicle.count({
      where: {
        status: 'MAINTENANCE',
      },
    });

    // Get scheduled maintenance
    const scheduledMaintenance = await db.maintenance.count({
      where: {
        status: 'SCHEDULED',
      },
    });

    // Get checked out vehicles not returned
    const checkedOutVehicles = await db.vehicleCheck.count({
      where: {
        status: 'CHECKED OUT',
      },
    });

    // Get recent reminders for notification list
    const recentReminders = await db.reminder.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
      },
      include: {
        vehicle: {
          select: { plateNumber: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // Get recent incidents
    const recentIncidents = await db.incident.findMany({
      where: {
        status: { in: ['OPEN', 'IN PROGRESS'] },
      },
      include: {
        vehicle: {
          select: { plateNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const totalNotifications = pendingReminders + openIncidents;

    return NextResponse.json({
      counts: {
        pendingReminders,
        overdueReminders,
        openIncidents,
        vehiclesInMaintenance,
        scheduledMaintenance,
        checkedOutVehicles,
        total: totalNotifications,
      },
      recentReminders: recentReminders.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        dueDate: r.dueDate,
        status: r.status,
        priority: r.priority,
        vehicle: r.vehicle?.plateNumber,
      })),
      recentIncidents: recentIncidents.map(i => ({
        id: i.id,
        type: i.incidentType,
        description: i.description,
        status: i.status,
        severity: i.severity,
        vehicle: i.vehicle?.plateNumber,
        date: i.date,
      })),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
