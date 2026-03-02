import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

// Helper to parse types from JSON string
function parseTypes(typeStr: string): string[] {
  try {
    const parsed = JSON.parse(typeStr);
    return Array.isArray(parsed) ? parsed : [typeStr];
  } catch {
    return [typeStr];
  }
}

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

    const maintenance = await db.maintenance.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...maintenance,
      types: parseTypes(maintenance.type),
    });
  } catch (error) {
    console.error('Get maintenance error:', error);
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

    // Convert types array to JSON string
    const typeStr = Array.isArray(data.types) 
      ? JSON.stringify(data.types) 
      : data.type;

    const maintenance = await db.maintenance.update({
      where: { id },
      data: {
        vehicleId: data.vehicleId,
        type: typeStr,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        odometer: data.odometer !== undefined ? parseFloat(data.odometer) : undefined,
        serviceProvider: data.serviceProvider,
        status: data.status,
        priority: data.priority,
        notes: data.notes,
      },
      include: {
        vehicle: true,
      },
    });

    // Update vehicle status based on maintenance status
    if (data.status === 'IN PROGRESS') {
      await db.vehicle.update({
        where: { id: maintenance.vehicleId },
        data: { status: 'MAINTENANCE' },
      });
    } else if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
      await db.vehicle.update({
        where: { id: maintenance.vehicleId },
        data: { 
          status: 'AVAILABLE',
          lastServiceDate: data.status === 'COMPLETED' ? new Date() : undefined,
        },
      });
    }

    return NextResponse.json({
      ...maintenance,
      types: parseTypes(maintenance.type),
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
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

    // Get maintenance record first to update vehicle status
    const maintenance = await db.maintenance.findUnique({
      where: { id },
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }

    await db.maintenance.delete({
      where: { id },
    });

    // Update vehicle status back to available if it was in maintenance
    if (maintenance.status === 'IN PROGRESS') {
      await db.vehicle.update({
        where: { id: maintenance.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
