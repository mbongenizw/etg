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
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.incidentType = type;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const incidents = await db.incident.findMany({
      where,
      include: {
        vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
        driver: { select: { id: true, name: true, employeeId: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Get incidents error:', error);
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

    const incident = await db.incident.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId || null,
        incidentType: data.incidentType,
        date: new Date(data.date),
        location: data.location || null,
        description: data.description,
        severity: data.severity || 'Minor',
        otherParty: data.otherParty || null,
        otherPartyInsurance: data.otherPartyInsurance || null,
        policeReport: data.policeReport || null,
        damageDescription: data.damageDescription || null,
        breakdownType: data.breakdownType || null,
        towRequired: data.towRequired || false,
        repairLocation: data.repairLocation || null,
        status: data.status || 'OPEN',
        resolutionDate: data.resolutionDate ? new Date(data.resolutionDate) : null,
        resolutionNotes: data.resolutionNotes || null,
        notes: data.notes || null,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Create incident error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
