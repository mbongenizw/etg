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

    const incident = await db.incident.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Get incident error:', error);
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

    const incident = await db.incident.update({
      where: { id },
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId || null,
        incidentType: data.incidentType,
        date: new Date(data.date),
        location: data.location,
        description: data.description,
        severity: data.severity,
        otherParty: data.otherParty,
        otherPartyInsurance: data.otherPartyInsurance,
        policeReport: data.policeReport,
        damageDescription: data.damageDescription,
        breakdownType: data.breakdownType,
        towRequired: data.towRequired,
        repairLocation: data.repairLocation,
        status: data.status,
        resolutionDate: data.resolutionDate ? new Date(data.resolutionDate) : null,
        resolutionNotes: data.resolutionNotes,
        notes: data.notes,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Update incident error:', error);
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

    await db.incident.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete incident error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
