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

    const driver = await db.driver.findUnique({
      where: { id },
      include: {
        vehicle: true,
        trips: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: { select: { plateNumber: true, make: true, model: true } },
          },
        },
        checkRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: { select: { plateNumber: true } },
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
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

    if (data.employeeId) {
      const existingEmployee = await db.driver.findFirst({
        where: {
          employeeId: data.employeeId,
          id: { not: id },
        },
      });

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        );
      }
    }

    if (data.licenseNumber) {
      const existingLicense = await db.driver.findFirst({
        where: {
          licenseNumber: data.licenseNumber,
          id: { not: id },
        },
      });

      if (existingLicense) {
        return NextResponse.json(
          { error: 'License number already exists' },
          { status: 400 }
        );
      }
    }

    const driver = await db.driver.update({
      where: { id },
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        licenseClass: data.licenseClass,
        status: data.status,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address,
        emergencyContact: data.emergencyContact,
        imageUrl: data.imageUrl,
        notes: data.notes,
        vehicleId: data.vehicleId || null,
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Update driver error:', error);
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

    await db.driver.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete driver error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
