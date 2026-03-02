'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, Car, Users, Fuel, Wrench, Route } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
}

interface Driver {
  id: string;
  name: string;
  employeeId: string;
}

interface ReportData {
  trips?: any[];
  maintenance?: any[];
  fuel?: any[];
}

export function ReportsModule() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [reportType, setReportType] = useState('trips');
  const [vehicleId, setVehicleId] = useState('all');
  const [driverId, setDriverId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) setVehicles(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) setDrivers(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (vehicleId !== 'all') params.append('vehicleId', vehicleId);
      if (driverId !== 'all') params.append('driverId', driverId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        toast.success('Report generated');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csv = '';
    let filename = '';

    if (reportType === 'trips' && reportData.trips) {
      csv = 'Date,Vehicle,Driver,Origin,Destination,Distance (km),Status\n';
      reportData.trips.forEach((trip: any) => {
        csv += `${new Date(trip.startTime).toLocaleDateString()},${trip.vehicle?.plateNumber || ''},${trip.driver?.name || ''},${trip.origin},${trip.destination},${trip.distance || ''},${trip.status}\n`;
      });
      filename = 'trips_report.csv';
    } else if (reportType === 'maintenance' && reportData.maintenance) {
      csv = 'Date,Vehicle,Type,Description,Status,Priority\n';
      reportData.maintenance.forEach((m: any) => {
        csv += `${new Date(m.startDate).toLocaleDateString()},${m.vehicle?.plateNumber || ''},${m.type},"${m.description}",${m.status},${m.priority}\n`;
      });
      filename = 'maintenance_report.csv';
    } else if (reportType === 'fuel' && reportData.fuel) {
      csv = 'Date,Vehicle,Fuel Type,Quantity (L),Odometer,Station\n';
      reportData.fuel.forEach((f: any) => {
        csv += `${new Date(f.date).toLocaleDateString()},${f.vehicle?.plateNumber || ''},${f.fuelType},${f.quantity},${f.odometer},${f.station || ''}\n`;
      });
      filename = 'fuel_report.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">Reports</h1>
        <p className="text-gray-600">Generate and export reports</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trips">Trip Reports</SelectItem>
                <SelectItem value="maintenance">Maintenance Reports</SelectItem>
                <SelectItem value="fuel">Fuel Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Driver</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1" />
            </div>
          </div>
        </CardContent>
        <CardContent className="pt-0 flex gap-2">
          <Button onClick={generateReport} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          {reportData && (
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Report Data */}
      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg capitalize">{reportType} Report</CardTitle>
            <span className="text-sm text-gray-500">
              {reportType === 'trips' && reportData.trips?.length} records
              {reportType === 'maintenance' && reportData.maintenance?.length} records
              {reportType === 'fuel' && reportData.fuel?.length} records
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {reportType === 'trips' && reportData.trips && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.trips.map((trip: any) => (
                    <TableRow key={trip.id}>
                      <TableCell>{new Date(trip.startTime).toLocaleDateString()}</TableCell>
                      <TableCell>{trip.vehicle?.plateNumber}</TableCell>
                      <TableCell>{trip.driver?.name}</TableCell>
                      <TableCell>{trip.origin} → {trip.destination}</TableCell>
                      <TableCell>{trip.distance ? `${trip.distance} km` : '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : trip.status === 'IN PROGRESS' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {trip.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'maintenance' && reportData.maintenance && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.maintenance.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{m.vehicle?.plateNumber}</TableCell>
                      <TableCell>{m.type}</TableCell>
                      <TableCell className="max-w-xs truncate">{m.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${m.priority === 'Urgent' ? 'bg-red-100 text-red-800' : m.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                          {m.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : m.status === 'IN PROGRESS' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {m.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'fuel' && reportData.fuel && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Station</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.fuel.map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                      <TableCell>{f.vehicle?.plateNumber}</TableCell>
                      <TableCell>{f.fuelType}</TableCell>
                      <TableCell className="font-medium">{f.quantity}</TableCell>
                      <TableCell>{f.odometer.toLocaleString()} km</TableCell>
                      <TableCell>{f.station || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {!reportData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Route className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Trip Reports</h3>
                <p className="text-sm text-gray-600">View trip history and distance tracking</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Maintenance Reports</h3>
                <p className="text-sm text-gray-600">Service and repair history</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Fuel className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Fuel Reports</h3>
                <p className="text-sm text-gray-600">Fuel consumption tracking</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
