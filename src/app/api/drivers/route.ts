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
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const drivers = await db.driver.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, plateNumber: true, make: true, model: true },
        },
        _count: {
          select: { trips: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
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

    // Check for unique constraints
    const existingEmployee = await db.driver.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    const existingLicense = await db.driver.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existingLicense) {
      return NextResponse.json(
        { error: 'License number already exists' },
        { status: 400 }
      );
    }

    const driver = await db.driver.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        licenseClass: data.licenseClass || null,
        status: data.status || 'ACTIVE',
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address || null,
        emergencyContact: data.emergencyContact || null,
        imageUrl: data.imageUrl || null,
        notes: data.notes || null,
        vehicleId: data.vehicleId || null,
      },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Create driver error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
