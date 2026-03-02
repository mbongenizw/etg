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
    const fuelType = searchParams.get('fuelType');

    // Build where clause
    const where: any = {};

    // Date filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Vehicle filter
    if (vehicleIds && vehicleIds !== 'all') {
      where.vehicleId = { in: vehicleIds.split(',') };
    }

    // Fuel type filter
    if (fuelType && fuelType !== 'all') {
      where.fuelType = fuelType;
    }

    const fuelRecords = await db.fuelRecord.findMany({
      where,
      include: {
        vehicle: { 
          select: { 
            id: true,
            plateNumber: true, 
            make: true, 
            model: true,
            fuelType: true 
          } 
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate summary statistics
    const totalRecords = fuelRecords.length;
    const totalFuel = fuelRecords.reduce((sum, record) => sum + record.quantity, 0);
    const avgFuelPerRecord = totalRecords > 0 ? totalFuel / totalRecords : 0;

    // Fuel by type
    const fuelByType = fuelRecords.reduce((acc, record) => {
      if (!acc[record.fuelType]) {
        acc[record.fuelType] = { total: 0, count: 0 };
      }
      acc[record.fuelType].total += record.quantity;
      acc[record.fuelType].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Fuel by vehicle
    const fuelByVehicle = fuelRecords.reduce((acc, record) => {
      const key = record.vehicle?.plateNumber || 'Unknown';
      if (!acc[key]) {
        acc[key] = { 
          total: 0, 
          count: 0, 
          records: [] as number[],
          vehicleId: record.vehicleId 
        };
      }
      acc[key].total += record.quantity;
      acc[key].count += 1;
      acc[key].records.push(record.quantity);
      return acc;
    }, {} as Record<string, { total: number; count: number; records: number[]; vehicleId: string }>);

    // Calculate average per vehicle
    const uniqueVehicles = Object.keys(fuelByVehicle).length;
    const avgFuelPerVehicle = uniqueVehicles > 0 ? totalFuel / uniqueVehicles : 0;

    // Average per fill-up by vehicle
    const avgFuelByVehicle = Object.entries(fuelByVehicle).reduce((acc, [plateNumber, data]) => {
      acc[plateNumber] = data.count > 0 ? data.total / data.count : 0;
      return acc;
    }, {} as Record<string, number>);

    // Fuel by month (for trend analysis)
    const fuelByMonth = fuelRecords.reduce((acc, record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, count: 0 };
      }
      acc[monthKey].total += record.quantity;
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Fuel by station
    const fuelByStation = fuelRecords.reduce((acc, record) => {
      if (record.station) {
        if (!acc[record.station]) {
          acc[record.station] = { total: 0, count: 0 };
        }
        acc[record.station].total += record.quantity;
        acc[record.station].count += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Odometer analysis - fuel efficiency estimation
    const vehicleEfficiency: Record<string, { totalDistance: number; totalFuel: number; records: any[] }> = {};
    
    // Group records by vehicle and sort by odometer
    const recordsByVehicle = fuelRecords.reduce((acc, record) => {
      if (!acc[record.vehicleId]) {
        acc[record.vehicleId] = [];
      }
      acc[record.vehicleId].push(record);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate distance between fill-ups for efficiency
    Object.entries(recordsByVehicle).forEach(([vehicleId, records]) => {
      const sortedRecords = records.sort((a, b) => a.odometer - b.odometer);
      let totalDistance = 0;
      
      for (let i = 1; i < sortedRecords.length; i++) {
        totalDistance += sortedRecords[i].odometer - sortedRecords[i - 1].odometer;
      }

      const plateNumber = sortedRecords[0]?.vehicle?.plateNumber || 'Unknown';
      vehicleEfficiency[plateNumber] = {
        totalDistance,
        totalFuel: sortedRecords.slice(1).reduce((sum, r) => sum + r.quantity, 0), // Exclude first record for efficiency calc
        records: sortedRecords,
      };
    });

    return NextResponse.json({
      fuelRecords,
      summary: {
        totalRecords,
        totalFuel,
        avgFuelPerRecord,
        avgFuelPerVehicle,
        uniqueVehicles,
        fuelByType,
        fuelByVehicle,
        avgFuelByVehicle,
        fuelByMonth,
        fuelByStation,
        vehicleEfficiency,
      },
    });
  } catch (error) {
    console.error('Get fuel reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
