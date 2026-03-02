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
      // Search for type within JSON array
      where.type = { contains: type };
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { serviceProvider: { contains: search, mode: 'insensitive' } },
      ];
    }

    const maintenance = await db.maintenance.findMany({
      where,
      include: {
        vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse types for each record
    const parsedMaintenance = maintenance.map(m => ({
      ...m,
      types: parseTypes(m.type),
    }));

    return NextResponse.json(parsedMaintenance);
  } catch (error) {
    console.error('Get maintenance error:', error);
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

    // Convert types array to JSON string
    const typeStr = Array.isArray(data.types) 
      ? JSON.stringify(data.types) 
      : JSON.stringify([data.types || data.type || 'Routine']);

    const maintenance = await db.maintenance.create({
      data: {
        vehicleId: data.vehicleId,
        type: typeStr,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        odometer: parseFloat(data.odometer) || 0,
        serviceProvider: data.serviceProvider || null,
        status: data.status || 'SCHEDULED',
        priority: data.priority || 'Normal',
        notes: data.notes || null,
      },
      include: {
        vehicle: true,
      },
    });

    // Update vehicle status if maintenance is in progress
    if (data.status === 'IN PROGRESS') {
      await db.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'MAINTENANCE' },
      });
    }

    // Return with parsed types
    return NextResponse.json({
      ...maintenance,
      types: parseTypes(maintenance.type),
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
