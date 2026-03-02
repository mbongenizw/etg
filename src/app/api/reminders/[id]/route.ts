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

    const reminder = await db.reminder.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: { id: true, plateNumber: true, make: true, model: true },
        },
        driver: {
          select: { id: true, name: true, employeeId: true },
        },
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Check if overdue
    if (reminder.status === 'PENDING' && new Date(reminder.dueDate) < new Date()) {
      return NextResponse.json({ ...reminder, status: 'OVERDUE' });
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Get reminder error:', error);
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

    const reminder = await db.reminder.update({
      where: { id },
      data: {
        type: data.type,
        title: data.title,
        description: data.description !== undefined ? data.description : undefined,
        vehicleId: data.vehicleId !== undefined ? (data.vehicleId || null) : undefined,
        driverId: data.driverId !== undefined ? (data.driverId || null) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        reminderDate: data.reminderDate !== undefined ? (data.reminderDate ? new Date(data.reminderDate) : null) : undefined,
        priority: data.priority,
        isRecurring: data.isRecurring !== undefined ? data.isRecurring : undefined,
        recurrenceType: data.recurrenceType !== undefined ? (data.recurrenceType || null) : undefined,
        recurrenceValue: data.recurrenceValue !== undefined ? (data.recurrenceValue ? parseInt(data.recurrenceValue) : null) : undefined,
        status: data.status,
        notes: data.notes !== undefined ? (data.notes || null) : undefined,
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
    console.error('Update reminder error:', error);
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

    await db.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
