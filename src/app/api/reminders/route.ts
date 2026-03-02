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
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const reminders = await db.reminder.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, plateNumber: true, make: true, model: true },
        },
        driver: {
          select: { id: true, name: true, employeeId: true },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, OVERDUE should be highlighted
        { dueDate: 'asc' },
      ],
    });

    // Update overdue status for reminders past due date
    const now = new Date();
    const updatedReminders = reminders.map((reminder) => {
      if (reminder.status === 'PENDING' && new Date(reminder.dueDate) < now) {
        return { ...reminder, status: 'OVERDUE' };
      }
      return reminder;
    });

    return NextResponse.json(updatedReminders);
  } catch (error) {
    console.error('Get reminders error:', error);
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

    const reminder = await db.reminder.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description || null,
        vehicleId: data.vehicleId || null,
        driverId: data.driverId || null,
        dueDate: new Date(data.dueDate),
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
        priority: data.priority || 'Normal',
        isRecurring: data.isRecurring || false,
        recurrenceType: data.recurrenceType || null,
        recurrenceValue: data.recurrenceValue ? parseInt(data.recurrenceValue) : null,
        status: data.status || 'PENDING',
        notes: data.notes || null,
      },
      include: {
        vehicle: {
          select: { id: true, plateNumber: true, make: true, model: true },
        },
        driver: {
          select: { id: true, name: true, employeeId: true },
        },
      },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
