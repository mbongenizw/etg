import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    console.log('Starting database reset and re-seed...');

    // ============================================
    // CLEAR EXISTING DATA (in correct order due to relations)
    // ============================================
    
    try {
      await db.rolePermission.deleteMany({});
    } catch (e) { /* ignore */ }
    
    await db.reminder.deleteMany({});
    await db.vehicleCheck.deleteMany({});
    await db.incident.deleteMany({});
    await db.trip.deleteMany({});
    await db.fuelRecord.deleteMany({});
    await db.maintenance.deleteMany({});
    await db.session.deleteMany({});
    await db.driver.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.user.deleteMany({});
    
    console.log('Cleared existing data');

    // ============================================
    // CREATE USERS
    // ============================================
    const hashedPassword = await hashPassword('password123');
    
    const users = await Promise.all([
      db.user.create({
        data: {
          username: 'admin',
          email: 'admin@etg.com',
          password: hashedPassword,
          fullName: 'System Administrator',
          role: 'Admin',
          phone: '+263 771 000 001',
          isActive: true,
        },
      }),
      db.user.create({
        data: {
          username: 'manager',
          email: 'manager@etg.com',
          password: hashedPassword,
          fullName: 'Tawanda Moyo',
          role: 'Manager',
          phone: '+263 772 000 002',
          isActive: true,
        },
      }),
      db.user.create({
        data: {
          username: 'user',
          email: 'user@etg.com',
          password: hashedPassword,
          fullName: 'Chenai Dube',
          role: 'User',
          phone: '+263 773 000 003',
          isActive: true,
        },
      }),
      db.user.create({
        data: {
          username: 'driver1',
          email: 'driver1@etg.com',
          password: hashedPassword,
          fullName: 'Kudakwashe Maposa',
          role: 'Driver',
          phone: '+263 774 000 004',
          isActive: true,
        },
      }),
    ]);

    console.log('Created users:', users.length);

    // ============================================
    // CREATE VEHICLES
    // ============================================
    const vehicles = await Promise.all([
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 1234',
          make: 'Toyota',
          model: 'Hilux',
          year: 2022,
          color: 'White',
          vehicleType: 'Truck',
          fuelType: 'Diesel',
          status: 'AVAILABLE',
          mileage: 45230,
          capacity: 1500,
          registrationDate: new Date('2022-03-15'),
          insuranceExpiry: new Date('2025-03-15'),
          lastServiceDate: new Date('2024-12-10'),
          nextServiceDate: new Date('2025-03-10'),
          notes: 'Primary delivery vehicle for Harare region',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 2345',
          make: 'Isuzu',
          model: 'NPR',
          year: 2021,
          color: 'Blue',
          vehicleType: 'Truck',
          fuelType: 'Diesel',
          status: 'IN USE',
          mileage: 89540,
          capacity: 4000,
          registrationDate: new Date('2021-06-20'),
          insuranceExpiry: new Date('2025-06-20'),
          lastServiceDate: new Date('2024-11-25'),
          nextServiceDate: new Date('2025-02-25'),
          notes: 'Heavy duty truck for bulk deliveries',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 3456',
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          color: 'Silver',
          vehicleType: 'Van',
          fuelType: 'Diesel',
          status: 'AVAILABLE',
          mileage: 23450,
          capacity: 1200,
          registrationDate: new Date('2023-01-10'),
          insuranceExpiry: new Date('2026-01-10'),
          lastServiceDate: new Date('2024-12-20'),
          nextServiceDate: new Date('2025-03-20'),
          notes: 'Light delivery van',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 4567',
          make: 'Mercedes',
          model: 'Sprinter',
          year: 2022,
          color: 'White',
          vehicleType: 'Van',
          fuelType: 'Diesel',
          status: 'MAINTENANCE',
          mileage: 67890,
          capacity: 1500,
          registrationDate: new Date('2022-08-05'),
          insuranceExpiry: new Date('2025-08-05'),
          lastServiceDate: new Date('2024-10-15'),
          nextServiceDate: new Date('2025-01-15'),
          notes: 'Currently in workshop for transmission repair',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 5678',
          make: 'Toyota',
          model: 'Land Cruiser',
          year: 2023,
          color: 'Black',
          vehicleType: 'SUV',
          fuelType: 'Diesel',
          status: 'AVAILABLE',
          mileage: 15670,
          capacity: 7,
          registrationDate: new Date('2023-05-20'),
          insuranceExpiry: new Date('2026-05-20'),
          lastServiceDate: new Date('2025-01-05'),
          nextServiceDate: new Date('2025-04-05'),
          notes: 'Management vehicle for site visits',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 6789',
          make: 'Honda',
          model: 'CR-V',
          year: 2022,
          color: 'Grey',
          vehicleType: 'SUV',
          fuelType: 'Petrol',
          status: 'IN USE',
          mileage: 34560,
          capacity: 5,
          registrationDate: new Date('2022-11-15'),
          insuranceExpiry: new Date('2025-11-15'),
          lastServiceDate: new Date('2024-12-01'),
          nextServiceDate: new Date('2025-03-01'),
          notes: 'Field operations vehicle',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 7890',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          color: 'White',
          vehicleType: 'Sedan',
          fuelType: 'Petrol',
          status: 'AVAILABLE',
          mileage: 8900,
          capacity: 5,
          registrationDate: new Date('2023-07-10'),
          insuranceExpiry: new Date('2026-07-10'),
          lastServiceDate: new Date('2024-11-10'),
          nextServiceDate: new Date('2025-02-10'),
          notes: 'Executive sedan for client meetings',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 8901',
          make: 'Nissan',
          model: 'Navara',
          year: 2021,
          color: 'Red',
          vehicleType: 'Truck',
          fuelType: 'Diesel',
          status: 'RETIRED',
          mileage: 156000,
          capacity: 1200,
          registrationDate: new Date('2021-02-28'),
          insuranceExpiry: new Date('2024-02-28'),
          notes: 'Retired due to high mileage - awaiting disposal',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 9012',
          make: 'Mitsubishi',
          model: 'L200',
          year: 2022,
          color: 'Green',
          vehicleType: 'Truck',
          fuelType: 'Diesel',
          status: 'AVAILABLE',
          mileage: 42300,
          capacity: 1000,
          registrationDate: new Date('2022-04-12'),
          insuranceExpiry: new Date('2025-04-12'),
          lastServiceDate: new Date('2024-12-15'),
          nextServiceDate: new Date('2025-03-15'),
          notes: 'Agricultural extension services vehicle',
        },
      }),
      db.vehicle.create({
        data: {
          plateNumber: 'ADC 0123',
          make: 'Ford',
          model: 'Ranger',
          year: 2023,
          color: 'Orange',
          vehicleType: 'Truck',
          fuelType: 'Diesel',
          status: 'IN USE',
          mileage: 19800,
          capacity: 1200,
          registrationDate: new Date('2023-09-01'),
          insuranceExpiry: new Date('2026-09-01'),
          lastServiceDate: new Date('2025-01-10'),
          nextServiceDate: new Date('2025-04-10'),
          notes: 'New vehicle for logistics team',
        },
      }),
    ]);

    console.log('Created vehicles:', vehicles.length);

    // ============================================
    // CREATE DRIVERS
    // ============================================
    const drivers = await Promise.all([
      db.driver.create({
        data: {
          employeeId: 'EMP-001',
          name: 'Tendai Chikwanha',
          email: 'tendai.chikwanha@etg.com',
          phone: '+263 771 234 567',
          licenseNumber: 'DL-123456',
          licenseExpiry: new Date('2025-08-15'),
          licenseClass: 'Class 1',
          status: 'ACTIVE',
          hireDate: new Date('2019-03-20'),
          dateOfBirth: new Date('1985-06-12'),
          address: '12 Harare Drive, Borrowdale, Harare',
          emergencyContact: 'Grace Chikwanha: +263 772 345 678',
          vehicleId: vehicles[1].id,
          notes: 'Senior driver with excellent safety record',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-002',
          name: 'Munashe Gumbo',
          email: 'munashe.gumbo@etg.com',
          phone: '+263 773 345 678',
          licenseNumber: 'DL-234567',
          licenseExpiry: new Date('2025-05-20'),
          licenseClass: 'Class 2',
          status: 'ACTIVE',
          hireDate: new Date('2020-06-15'),
          dateOfBirth: new Date('1990-11-25'),
          address: '45 Samora Machel Ave, Harare',
          emergencyContact: 'Tawanda Gumbo: +263 774 456 789',
          vehicleId: vehicles[5].id,
          notes: 'Specializes in long-distance deliveries',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-003',
          name: 'Rumbidzai Mhere',
          email: 'rumbidzai.mhere@etg.com',
          phone: '+263 775 456 789',
          licenseNumber: 'DL-345678',
          licenseExpiry: new Date('2024-12-31'),
          licenseClass: 'Class 3',
          status: 'ACTIVE',
          hireDate: new Date('2021-01-10'),
          dateOfBirth: new Date('1988-03-18'),
          address: '78 Josiah Tongogara, Bulawayo',
          emergencyContact: 'Farai Mhere: +263 776 567 890',
          notes: 'Van specialist for urban deliveries',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-004',
          name: 'Kudzai Maronga',
          email: 'kudzai.maronga@etg.com',
          phone: '+263 777 567 890',
          licenseNumber: 'DL-456789',
          licenseExpiry: new Date('2025-09-10'),
          licenseClass: 'Class 1',
          status: 'ACTIVE',
          hireDate: new Date('2018-08-25'),
          dateOfBirth: new Date('1982-09-30'),
          address: '23 Nelson Mandela Ave, Gweru',
          emergencyContact: 'Chiedza Maronga: +263 778 678 901',
          vehicleId: vehicles[0].id,
          notes: 'Experienced truck driver with Class 1 license',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-005',
          name: 'Tafadzwa Chikuni',
          email: 'tafadzwa.chikuni@etg.com',
          phone: '+263 779 678 901',
          licenseNumber: 'DL-567890',
          licenseExpiry: new Date('2025-03-25'),
          licenseClass: 'Class 4',
          status: 'ON LEAVE',
          hireDate: new Date('2020-11-05'),
          dateOfBirth: new Date('1992-01-14'),
          address: '56 Julius Nyerere Way, Mutare',
          emergencyContact: 'Pride Chikuni: +263 780 789 012',
          notes: 'On annual leave until end of February',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-006',
          name: 'Blessing Ndlovu',
          email: 'blessing.ndlovu@etg.com',
          phone: '+263 781 789 012',
          licenseNumber: 'DL-678901',
          licenseExpiry: new Date('2024-11-15'),
          licenseClass: 'Class 2',
          status: 'ACTIVE',
          hireDate: new Date('2022-02-28'),
          dateOfBirth: new Date('1995-07-22'),
          address: '89 Robert Mugabe Rd, Kwekwe',
          emergencyContact: 'Sibongile Ndlovu: +263 782 890 123',
          vehicleId: vehicles[9].id,
          notes: 'Recently completed defensive driving course',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-007',
          name: 'Nyasha Magwegwe',
          email: 'nyasha.magwegwe@etg.com',
          phone: '+263 783 890 123',
          licenseNumber: 'DL-789012',
          licenseExpiry: new Date('2025-07-30'),
          licenseClass: 'Class 5',
          status: 'INACTIVE',
          hireDate: new Date('2019-05-15'),
          dateOfBirth: new Date('1987-12-08'),
          address: '34 Leopold Takawira, Masvingo',
          emergencyContact: 'Thandiwe Magwegwe: +263 784 901 234',
          notes: 'Currently suspended pending investigation',
        },
      }),
      db.driver.create({
        data: {
          employeeId: 'EMP-008',
          name: 'Godwin Zhou',
          email: 'godwin.zhou@etg.com',
          phone: '+263 785 901 234',
          licenseNumber: 'DL-890123',
          licenseExpiry: new Date('2025-04-18'),
          licenseClass: 'Class 1',
          status: 'ACTIVE',
          hireDate: new Date('2017-09-01'),
          dateOfBirth: new Date('1980-04-05'),
          address: '67 Jason Moyo Ave, Harare',
          emergencyContact: 'Memory Zhou: +263 786 012 345',
          notes: 'Fleet supervisor for northern region',
        },
      }),
    ]);

    console.log('Created drivers:', drivers.length);

    // ============================================
    // CREATE SERVICE RECORDS
    // ============================================
    const serviceRecords = await Promise.all([
      db.maintenance.create({
        data: {
          vehicleId: vehicles[0].id,
          type: JSON.stringify(['Oil Change', 'Tire Service']),
          description: 'Routine 45,000km service including oil change and tire rotation',
          startDate: new Date('2024-12-10'),
          endDate: new Date('2024-12-10'),
          odometer: 45230,
          serviceProvider: 'Toyota Service Center - Harare',
          status: 'COMPLETED',
          priority: 'Normal',
          notes: 'All filters replaced. Brake pads at 60% remaining.',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[1].id,
          type: JSON.stringify(['Engine Tune-up', 'Brake Service']),
          description: 'Major 90,000km service with engine tune-up',
          startDate: new Date('2024-11-25'),
          endDate: new Date('2024-11-26'),
          odometer: 89540,
          serviceProvider: 'Isuzu Workshop - Msasa',
          status: 'COMPLETED',
          priority: 'High',
          notes: 'Injectors cleaned, brake pads replaced',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[3].id,
          type: JSON.stringify(['Transmission Service']),
          description: 'Transmission repair and clutch replacement',
          startDate: new Date('2025-01-20'),
          odometer: 67890,
          serviceProvider: 'Mercedes Benz Workshop',
          status: 'IN PROGRESS',
          priority: 'Urgent',
          notes: 'Waiting for transmission parts from Germany',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[2].id,
          type: JSON.stringify(['Air Filter Replacement', 'Fluid Top-up']),
          description: 'Quarterly maintenance check',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-20'),
          odometer: 23450,
          serviceProvider: 'ETG Service Center',
          status: 'COMPLETED',
          priority: 'Low',
          notes: 'All fluids topped up, air filter replaced',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[4].id,
          type: JSON.stringify(['Oil Change']),
          description: 'Scheduled oil change',
          startDate: new Date('2025-01-05'),
          endDate: new Date('2025-01-05'),
          odometer: 15670,
          serviceProvider: 'Toyota Service Center',
          status: 'COMPLETED',
          priority: 'Normal',
          notes: 'Synthetic oil used. Next service at 25,000km',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[6].id,
          type: JSON.stringify(['AC Service']),
          description: 'Air conditioning service and regas',
          startDate: new Date('2025-02-15'),
          odometer: 8900,
          serviceProvider: 'Auto Aircon Specialists',
          status: 'SCHEDULED',
          priority: 'Low',
          notes: 'Booked for AC regas before summer',
        },
      }),
    ]);

    console.log('Created service records:', serviceRecords.length);

    // ============================================
    // CREATE MAINTENANCE RECORDS
    // ============================================
    const maintenanceRecords = await Promise.all([
      db.maintenance.create({
        data: {
          vehicleId: vehicles[0].id,
          type: JSON.stringify(['Routine Maintenance']),
          description: 'Monthly vehicle inspection and safety check',
          startDate: new Date('2025-01-02'),
          endDate: new Date('2025-01-02'),
          odometer: 45230,
          serviceProvider: 'ETG Service Center',
          status: 'COMPLETED',
          priority: 'Normal',
          notes: 'All safety items checked and passed',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[1].id,
          type: JSON.stringify(['Repair', 'Suspension Repair']),
          description: 'Rear suspension bush replacement',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-11'),
          odometer: 89750,
          serviceProvider: 'Isuzu Workshop - Msasa',
          status: 'COMPLETED',
          priority: 'High',
          notes: 'Both rear bushings replaced, wheel alignment done',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[3].id,
          type: JSON.stringify(['Emergency Repair', 'Transmission Repair']),
          description: 'Emergency transmission overhaul',
          startDate: new Date('2025-01-20'),
          odometer: 67890,
          serviceProvider: 'Mercedes Benz Workshop',
          status: 'IN PROGRESS',
          priority: 'Urgent',
          notes: 'Transmission failure reported. Parts on order.',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[5].id,
          type: JSON.stringify(['Preventive Maintenance']),
          description: 'Preventive brake inspection',
          startDate: new Date('2025-01-08'),
          endDate: new Date('2025-01-08'),
          odometer: 34560,
          serviceProvider: 'ETG Service Center',
          status: 'COMPLETED',
          priority: 'Normal',
          notes: 'Brake pads at 75%, tires rotated',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[8].id,
          type: JSON.stringify(['Inspection']),
          description: 'Pre-compliance inspection',
          startDate: new Date('2025-01-25'),
          odometer: 42300,
          serviceProvider: 'VID Test Center',
          status: 'SCHEDULED',
          priority: 'High',
          notes: 'Vehicle inspection due for license renewal',
        },
      }),
      db.maintenance.create({
        data: {
          vehicleId: vehicles[9].id,
          type: JSON.stringify(['Tire Replacement']),
          description: 'Replace all four tires',
          startDate: new Date('2025-01-12'),
          endDate: new Date('2025-01-12'),
          odometer: 19800,
          serviceProvider: 'Tire Zone Harare',
          status: 'COMPLETED',
          priority: 'Normal',
          notes: 'New all-terrain tires installed',
        },
      }),
    ]);

    console.log('Created maintenance records:', maintenanceRecords.length);

    // ============================================
    // CREATE FUEL RECORDS
    // ============================================
    const fuelRecords = await Promise.all([
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[0].id,
          date: new Date('2025-01-05'),
          fuelType: 'Diesel',
          quantity: 65,
          odometer: 44800,
          station: 'Puma Service Station - Samora Machel',
          receiptNumber: 'INV-2025-001234',
          notes: 'Full tank',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[0].id,
          date: new Date('2025-01-12'),
          fuelType: 'Diesel',
          quantity: 58,
          odometer: 45230,
          station: 'Shell - Borrowdale',
          receiptNumber: 'INV-2025-001567',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[1].id,
          date: new Date('2025-01-03'),
          fuelType: 'Diesel',
          quantity: 85,
          odometer: 89000,
          station: 'Puma Service Station - Msasa',
          receiptNumber: 'INV-2025-001189',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[1].id,
          date: new Date('2025-01-15'),
          fuelType: 'Diesel',
          quantity: 92,
          odometer: 89750,
          station: 'Total - Graniteside',
          receiptNumber: 'INV-2025-001890',
          notes: 'Long distance trip to Bulawayo',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[2].id,
          date: new Date('2025-01-08'),
          fuelType: 'Diesel',
          quantity: 55,
          odometer: 23100,
          station: 'Shell - Avondale',
          receiptNumber: 'INV-2025-001345',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[4].id,
          date: new Date('2025-01-10'),
          fuelType: 'Diesel',
          quantity: 75,
          odometer: 15200,
          station: 'Puma - Chisipite',
          receiptNumber: 'INV-2025-001456',
          notes: 'Site visit to Kadoma',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[5].id,
          date: new Date('2025-01-06'),
          fuelType: 'Petrol',
          quantity: 42,
          odometer: 34200,
          station: 'Shell - Belvedere',
          receiptNumber: 'INV-2025-001267',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[5].id,
          date: new Date('2025-01-18'),
          fuelType: 'Petrol',
          quantity: 38,
          odometer: 34560,
          station: 'Total - Newlands',
          receiptNumber: 'INV-2025-002012',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[6].id,
          date: new Date('2025-01-14'),
          fuelType: 'Petrol',
          quantity: 35,
          odometer: 8750,
          station: 'Puma - Mount Pleasant',
          receiptNumber: 'INV-2025-001678',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[8].id,
          date: new Date('2025-01-11'),
          fuelType: 'Diesel',
          quantity: 60,
          odometer: 42000,
          station: 'Shell - Arcadia',
          receiptNumber: 'INV-2025-001512',
        },
      }),
      db.fuelRecord.create({
        data: {
          vehicleId: vehicles[9].id,
          date: new Date('2025-01-16'),
          fuelType: 'Diesel',
          quantity: 68,
          odometer: 19600,
          station: 'Puma - Ruwa',
          receiptNumber: 'INV-2025-001945',
          notes: 'Delivery to Marondera',
        },
      }),
    ]);

    console.log('Created fuel records:', fuelRecords.length);

    // ============================================
    // CREATE TRIPS
    // ============================================
    const trips = await Promise.all([
      db.trip.create({
        data: {
          vehicleId: vehicles[0].id,
          driverId: drivers[3].id,
          tripType: 'Delivery',
          origin: 'ETG Warehouse - Harare',
          destination: 'Client Depot - Chinhoyi',
          startOdometer: 45000,
          endOdometer: 45180,
          startTime: new Date('2025-01-10T06:30:00'),
          endTime: new Date('2025-01-10T12:00:00'),
          distance: 180,
          purpose: 'Fertilizer delivery - 2 ton consignment',
          status: 'COMPLETED',
          notes: 'Delivered on time. Client satisfied.',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[1].id,
          driverId: drivers[0].id,
          tripType: 'Business',
          origin: 'ETG Head Office - Harare',
          destination: 'Distribution Center - Bulawayo',
          startOdometer: 89200,
          endOdometer: 89750,
          startTime: new Date('2025-01-13T05:00:00'),
          endTime: new Date('2025-01-13T14:30:00'),
          distance: 550,
          purpose: 'Bulk seed transport',
          status: 'COMPLETED',
          notes: '4 ton seed delivery completed',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[2].id,
          driverId: drivers[2].id,
          tripType: 'Delivery',
          origin: 'Harare Warehouse',
          destination: 'Hardware Store - Ruwa',
          startOdometer: 23200,
          endOdometer: 23350,
          startTime: new Date('2025-01-15T08:00:00'),
          endTime: new Date('2025-01-15T11:00:00'),
          distance: 150,
          purpose: 'Small parts delivery',
          status: 'COMPLETED',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[4].id,
          driverId: drivers[1].id,
          tripType: 'Business',
          origin: 'ETG Office - Harare',
          destination: 'Kadoma Depot',
          startOdometer: 15200,
          endOdometer: 15500,
          startTime: new Date('2025-01-09T07:00:00'),
          endTime: new Date('2025-01-09T13:00:00'),
          distance: 300,
          purpose: 'Management site visit',
          status: 'COMPLETED',
          notes: 'Quarterly review meeting',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[5].id,
          driverId: drivers[5].id,
          tripType: 'Delivery',
          origin: 'Harare',
          destination: 'Marondera',
          startOdometer: 34300,
          endOdometer: 34560,
          startTime: new Date('2025-01-17T08:00:00'),
          endTime: new Date('2025-01-17T12:00:00'),
          distance: 260,
          purpose: 'Agricultural supplies delivery',
          status: 'COMPLETED',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[9].id,
          driverId: drivers[5].id,
          tripType: 'Delivery',
          origin: 'ETG Warehouse - Harare',
          destination: 'Mutare Depot',
          startOdometer: 19600,
          startTime: new Date('2025-01-27T06:00:00'),
          purpose: 'Chemical supplies delivery',
          status: 'IN PROGRESS',
          notes: 'Expected return tomorrow evening',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[6].id,
          driverId: drivers[3].id,
          tripType: 'Business',
          origin: 'Harare',
          destination: 'Gweru',
          startOdometer: 8900,
          startTime: new Date('2025-01-28T07:00:00'),
          purpose: 'Client meeting at Gweru branch',
          status: 'SCHEDULED',
          notes: 'Executive transport required',
        },
      }),
      db.trip.create({
        data: {
          vehicleId: vehicles[8].id,
          driverId: drivers[0].id,
          tripType: 'Delivery',
          origin: 'Harare',
          destination: 'Kwekwe',
          startOdometer: 42300,
          startTime: new Date('2025-01-29T05:30:00'),
          purpose: 'Farm equipment delivery',
          status: 'SCHEDULED',
        },
      }),
    ]);

    console.log('Created trips:', trips.length);

    // ============================================
    // CREATE INCIDENTS
    // ============================================
    const incidents = await Promise.all([
      db.incident.create({
        data: {
          vehicleId: vehicles[3].id,
          driverId: drivers[4].id,
          incidentType: 'Breakdown',
          date: new Date('2025-01-18'),
          location: 'Harare-Bulawayo Highway, km 45',
          description: 'Transmission failure while in transit',
          severity: 'Major',
          breakdownType: 'Transmission',
          towRequired: true,
          repairLocation: 'Mercedes Benz Workshop - Harare',
          status: 'IN PROGRESS',
          notes: 'Vehicle towed to workshop. Parts ordered from Germany.',
        },
      }),
      db.incident.create({
        data: {
          vehicleId: vehicles[1].id,
          driverId: drivers[0].id,
          incidentType: 'Accident',
          date: new Date('2024-11-15'),
          location: 'Samora Machel Ave, Harare',
          description: 'Minor bumper collision at traffic lights',
          severity: 'Minor',
          otherParty: 'Private motorist',
          otherPartyInsurance: 'Econet Insurance',
          policeReport: 'PR-2024-1115-001',
          damageDescription: 'Front bumper scratches and dent',
          status: 'RESOLVED',
          resolutionDate: new Date('2024-12-20'),
          resolutionNotes: 'Insurance claim processed, repairs completed',
        },
      }),
      db.incident.create({
        data: {
          vehicleId: vehicles[8].id,
          incidentType: 'Breakdown',
          date: new Date('2024-12-05'),
          location: 'Enterprise Road, Harare',
          description: 'Flat tire - rear left wheel',
          severity: 'Minor',
          breakdownType: 'Tire',
          towRequired: false,
          status: 'RESOLVED',
          resolutionDate: new Date('2024-12-05'),
          resolutionNotes: 'Spare tire fitted. Punctured tire repaired.',
        },
      }),
    ]);

    console.log('Created incidents:', incidents.length);

    // ============================================
    // CREATE REMINDERS
    // ============================================
    const reminders = await Promise.all([
      db.reminder.create({
        data: {
          type: 'Insurance',
          title: 'ADC 1234 Insurance Renewal',
          description: 'Annual insurance renewal for Toyota Hilux',
          vehicleId: vehicles[0].id,
          dueDate: new Date('2025-03-15'),
          reminderDate: new Date('2025-02-15'),
          priority: 'High',
          isRecurring: true,
          recurrenceType: 'Yearly',
          recurrenceValue: 1,
          status: 'PENDING',
          notes: 'Contact insurance broker by Feb 28',
        },
      }),
      db.reminder.create({
        data: {
          type: 'License',
          title: 'Vehicle License Renewal - ADC 2345',
          description: 'Annual vehicle license for Isuzu NPR',
          vehicleId: vehicles[1].id,
          dueDate: new Date('2025-06-20'),
          reminderDate: new Date('2025-05-20'),
          priority: 'High',
          isRecurring: true,
          recurrenceType: 'Yearly',
          recurrenceValue: 1,
          status: 'PENDING',
        },
      }),
      db.reminder.create({
        data: {
          type: 'Service',
          title: 'ADC 3456 - Quarterly Service Due',
          description: 'Scheduled quarterly maintenance for Ford Transit',
          vehicleId: vehicles[2].id,
          dueDate: new Date('2025-03-20'),
          reminderDate: new Date('2025-03-01'),
          priority: 'Normal',
          isRecurring: true,
          recurrenceType: 'Monthly',
          recurrenceValue: 3,
          status: 'PENDING',
        },
      }),
      db.reminder.create({
        data: {
          type: 'License',
          title: 'Tendai Chikwanha License Renewal',
          description: 'Drivers license renewal due',
          driverId: drivers[0].id,
          dueDate: new Date('2025-08-15'),
          reminderDate: new Date('2025-07-15'),
          priority: 'High',
          isRecurring: true,
          recurrenceType: 'Yearly',
          recurrenceValue: 5,
          status: 'PENDING',
        },
      }),
      db.reminder.create({
        data: {
          type: 'License',
          title: 'Rumbidzai Mhere License Expiring',
          description: 'License renewal required - expires end of month',
          driverId: drivers[2].id,
          dueDate: new Date('2024-12-31'),
          reminderDate: new Date('2024-12-01'),
          priority: 'Urgent',
          status: 'OVERDUE',
          notes: 'License expired - driver needs to renew urgently',
        },
      }),
      db.reminder.create({
        data: {
          type: 'Custom',
          title: 'Annual Fleet Audit',
          description: 'Schedule annual fleet audit and compliance check',
          dueDate: new Date('2025-02-28'),
          reminderDate: new Date('2025-02-01'),
          priority: 'High',
          status: 'PENDING',
          notes: 'Coordinate with compliance department',
        },
      }),
      db.reminder.create({
        data: {
          type: 'Inspection',
          title: 'VID Inspection - ADC 9012',
          description: 'Vehicle inspection for license renewal',
          vehicleId: vehicles[8].id,
          dueDate: new Date('2025-01-25'),
          reminderDate: new Date('2025-01-20'),
          priority: 'High',
          status: 'PENDING',
        },
      }),
    ]);

    console.log('Created reminders:', reminders.length);

    // ============================================
    // CREATE VEHICLE CHECKS
    // ============================================
    const vehicleChecks = await Promise.all([
      db.vehicleCheck.create({
        data: {
          vehicleId: vehicles[0].id,
          driverId: drivers[3].id,
          checkOutTime: new Date('2025-01-20T06:00:00'),
          checkOutOdometer: 45200,
          purpose: 'Fertilizer delivery to Chinhoyi',
          destination: 'Chinhoyi',
          expectedReturn: new Date('2025-01-20T14:00:00'),
          checkInTime: new Date('2025-01-20T13:30:00'),
          checkInOdometer: 45400,
          distanceTraveled: 200,
          fuelLevel: '3/4',
          condition: 'Good',
          status: 'CHECKED IN',
          notes: 'Vehicle returned in good condition',
        },
      }),
      db.vehicleCheck.create({
        data: {
          vehicleId: vehicles[2].id,
          driverId: drivers[2].id,
          checkOutTime: new Date('2025-01-21T07:30:00'),
          checkOutOdometer: 23450,
          purpose: 'Document delivery to airport',
          destination: 'RG Mugabe Airport',
          expectedReturn: new Date('2025-01-21T10:00:00'),
          checkInTime: new Date('2025-01-21T09:45:00'),
          checkInOdometer: 23520,
          distanceTraveled: 70,
          fuelLevel: '1/2',
          condition: 'Good',
          status: 'CHECKED IN',
        },
      }),
      db.vehicleCheck.create({
        data: {
          vehicleId: vehicles[9].id,
          driverId: drivers[5].id,
          checkOutTime: new Date('2025-01-27T06:00:00'),
          checkOutOdometer: 19600,
          purpose: 'Chemical supplies to Mutare',
          destination: 'Mutare Depot',
          expectedReturn: new Date('2025-01-28T18:00:00'),
          status: 'CHECKED OUT',
          notes: 'Overnight trip - return tomorrow',
        },
      }),
    ]);

    console.log('Created vehicle checks:', vehicleChecks.length);

    // ============================================
    // CREATE ROLE PERMISSIONS (if model exists)
    // ============================================
    let rolePermissions: any[] = [];
    try {
      // @ts-ignore - model may not exist in cached client
      if (db.rolePermission) {
        rolePermissions = await Promise.all([
          db.rolePermission.create({
            data: {
              role: 'Admin',
              permissions: JSON.stringify([
                'dashboard', 'vehicles', 'drivers', 'service', 'maintenance',
                'fuel', 'incidents', 'reminders', 'vehicle-checks', 'reports',
                'users', 'roles', 'settings'
              ]),
              description: 'Full system access',
            },
          }),
          db.rolePermission.create({
            data: {
              role: 'Manager',
              permissions: JSON.stringify([
                'dashboard', 'vehicles', 'drivers', 'service', 'maintenance',
                'fuel', 'incidents', 'reminders', 'vehicle-checks', 'reports'
              ]),
              description: 'Fleet management access without admin functions',
            },
          }),
          db.rolePermission.create({
            data: {
              role: 'User',
              permissions: JSON.stringify([
                'dashboard', 'vehicles', 'drivers', 'fuel', 'vehicle-checks'
              ]),
              description: 'Basic operational access',
            },
          }),
          db.rolePermission.create({
            data: {
              role: 'Driver',
              permissions: JSON.stringify([
                'dashboard', 'vehicle-checks'
              ]),
              description: 'Driver-level access for check-in/out',
            },
          }),
        ]);
      }
    } catch (e) {
      console.log('RolePermission model not available, skipping...');
    }

    console.log('Created role permissions:', rolePermissions.length);

    // ============================================
    // CREATE BACKUP SETTINGS (if model exists)
    // ============================================
    try {
      // @ts-ignore - model may not exist in cached client
      if (db.backupSettings) {
        await db.backupSettings.create({
          data: {
            enabled: true,
            frequency: 'daily',
            keepCount: 10,
          },
        });
      }
    } catch (e) {
      console.log('BackupSettings model not available, skipping...');
    }

    console.log('Database reset and seed completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database reset and re-seeded successfully!',
      summary: {
        users: users.length,
        vehicles: vehicles.length,
        drivers: drivers.length,
        serviceRecords: serviceRecords.length,
        maintenanceRecords: maintenanceRecords.length,
        fuelRecords: fuelRecords.length,
        trips: trips.length,
        incidents: incidents.length,
        reminders: reminders.length,
        vehicleChecks: vehicleChecks.length,
        rolePermissions: rolePermissions.length,
      },
      credentials: {
        admin: { email: 'admin@etg.com', password: 'password123' },
        manager: { email: 'manager@etg.com', password: 'password123' },
        user: { email: 'user@etg.com', password: 'password123' },
        driver: { email: 'driver1@etg.com', password: 'password123' },
      },
    });
  } catch (error) {
    console.error('Reset seed error:', error);
    return NextResponse.json(
      { error: 'Failed to reset and seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
