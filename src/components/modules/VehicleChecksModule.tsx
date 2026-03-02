// Vehicle Checks Module - Check Out/In workflow
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Plus, Edit, Trash2, Search, Eye, Car, Users, Calendar, ChevronLeft, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleCheck {
  id: string;
  vehicleId: string;
  driverId: string;
  checkOutTime: string;
  checkOutOdometer: number;
  purpose: string | null;
  destination: string | null;
  expectedReturn: string | null;
  checkInTime: string | null;
  checkInOdometer: number | null;
  distanceTraveled: number | null;
  fuelLevel: string | null;
  condition: string | null;
  issues: string | null;
  status: string;
  notes: string | null;
  vehicle: { id: string; plateNumber: string; make: string; model: string };
  driver: { id: string; name: string; employeeId: string };
  createdAt: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  status: string;
  mileage: number;
}

interface Driver {
  id: string;
  name: string;
  employeeId: string;
  status: string;
}

const fuelLevels = ['Full', '3/4', '1/2', '1/4', 'Empty'];
const conditions = ['Good', 'Fair', 'Poor'];

export function VehicleChecksModule() {
  const [checks, setChecks] = useState<VehicleCheck[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<VehicleCheck | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleCheck>>({});
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchChecks();
    fetchVehicles();
    fetchDrivers();
  }, [statusFilter, search]);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/vehicle-checks?${params}`);
      if (res.ok) setChecks(await res.json());
    } catch (error) {
      toast.error('Failed to load vehicle checks');
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenDialog = (check?: VehicleCheck) => {
    if (check) {
      setSelectedCheck(check);
      setFormData({
        ...check,
        expectedReturn: check.expectedReturn ? check.expectedReturn.slice(0, 16) : '',
      });
    } else {
      setSelectedCheck(null);
      setFormData({
        status: 'CHECKED OUT',
        checkOutOdometer: 0,
        checkOutTime: new Date().toISOString().slice(0, 16),
      });
    }
    setDialogOpen(true);
  };

  const handleCheckIn = (check: VehicleCheck) => {
    setSelectedCheck(check);
    setFormData({
      checkInOdometer: check.checkOutOdometer,
      checkInTime: new Date().toISOString().slice(0, 16),
      fuelLevel: 'Full',
      condition: 'Good',
    });
    setCheckInDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCheckInDialogOpen(false);
    setSelectedCheck(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.vehicleId || !formData.driverId || !formData.checkOutOdometer) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = selectedCheck ? `/api/vehicle-checks/${selectedCheck.id}` : '/api/vehicle-checks';
      const method = selectedCheck ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          checkOutTime: formData.checkOutTime ? new Date(formData.checkOutTime).toISOString() : new Date().toISOString(),
          expectedReturn: formData.expectedReturn ? new Date(formData.expectedReturn).toISOString() : null,
        }),
      });

      if (res.ok) {
        toast.success(selectedCheck ? 'Check-out updated' : 'Vehicle checked out');
        handleCloseDialog();
        fetchChecks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckInSave = async () => {
    if (!selectedCheck || !formData.checkInOdometer) {
      toast.error('Please fill in the odometer reading');
      return;
    }

    setSaving(true);
    try {
      const distanceTraveled = formData.checkInOdometer - selectedCheck.checkOutOdometer;

      const res = await fetch(`/api/vehicle-checks/${selectedCheck.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInOdometer: formData.checkInOdometer,
          checkInTime: formData.checkInTime ? new Date(formData.checkInTime).toISOString() : new Date().toISOString(),
          distanceTraveled,
          fuelLevel: formData.fuelLevel,
          condition: formData.condition,
          issues: formData.issues,
        }),
      });

      if (res.ok) {
        toast.success('Vehicle checked in successfully');
        handleCloseDialog();
        fetchChecks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to check in');
      }
    } catch (error) {
      toast.error('Failed to check in');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCheck) return;
    try {
      const res = await fetch(`/api/vehicle-checks/${selectedCheck.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Record deleted');
        setDeleteDialogOpen(false);
        setSelectedCheck(null);
        fetchChecks();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'CHECKED OUT') return <Badge className="bg-orange-100 text-orange-800">Checked Out</Badge>;
    return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
  };

  const paginatedChecks = checks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(checks.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Vehicle Checks</h1>
          <p className="text-gray-600">Manage check-out and check-in records</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Check Out Vehicle
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by vehicle or driver..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CHECKED OUT">Checked Out</SelectItem>
                <SelectItem value="CHECKED IN">Checked In</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : checks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ClipboardCheck className="h-12 w-12 mb-4 text-gray-300" />
              <p>No vehicle checks found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{check.vehicle.plateNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{check.driver.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(check.checkOutTime).toLocaleDateString()}
                          <p className="text-xs text-gray-500">{new Date(check.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{check.checkOutOdometer.toLocaleString()}</span>
                        {check.checkInOdometer && <span className="text-xs text-gray-500"> → {check.checkInOdometer.toLocaleString()}</span>}
                      </TableCell>
                      <TableCell>
                        {check.distanceTraveled !== null ? <span className="font-medium">{check.distanceTraveled.toLocaleString()} km</span> : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(check.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {check.status === 'CHECKED OUT' && (
                            <Button size="sm" onClick={() => handleCheckIn(check)} className="bg-green-600 hover:bg-green-700">
                              <LogIn className="h-4 w-4 mr-1" /> Check In
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCheck(check); setViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(check)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCheck(check); setDeleteDialogOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, checks.length)} of {checks.length}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm">{currentPage} of {totalPages}</span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Check Out Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCheck ? 'Edit Check-Out' : 'Check Out Vehicle'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle *</Label>
              <Select value={formData.vehicleId || ''} onValueChange={(v) => {
                const vehicle = vehicles.find(veh => veh.id === v);
                setFormData({ ...formData, vehicleId: v, checkOutOdometer: vehicle?.mileage || 0 });
              }}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => v.status !== 'RETIRED').map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver *</Label>
              <Select value={formData.driverId || ''} onValueChange={(v) => setFormData({ ...formData, driverId: v })}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status === 'ACTIVE').map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkOutOdometer">Odometer (km) *</Label>
                <Input id="checkOutOdometer" type="number" value={formData.checkOutOdometer || ''} onChange={(e) => setFormData({ ...formData, checkOutOdometer: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check Out Time</Label>
                <Input id="checkOutTime" type="datetime-local" value={formData.checkOutTime || ''} onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" value={formData.purpose || ''} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="Purpose of the trip" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" value={formData.destination || ''} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="Destination" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedReturn">Expected Return</Label>
              <Input id="expectedReturn" type="datetime-local" value={formData.expectedReturn || ''} onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">{saving ? 'Saving...' : 'Check Out'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check In Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Check In Vehicle</DialogTitle>
          </DialogHeader>
          {selectedCheck && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm"><strong>Vehicle:</strong> {selectedCheck.vehicle.plateNumber}</p>
              <p className="text-sm"><strong>Driver:</strong> {selectedCheck.driver.name}</p>
              <p className="text-sm"><strong>Check Out Odometer:</strong> {selectedCheck.checkOutOdometer.toLocaleString()} km</p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInOdometer">Odometer (km) *</Label>
                <Input id="checkInOdometer" type="number" value={formData.checkInOdometer || ''} onChange={(e) => setFormData({ ...formData, checkInOdometer: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check In Time</Label>
                <Input id="checkInTime" type="datetime-local" value={formData.checkInTime || ''} onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })} />
              </div>
            </div>
            {formData.checkInOdometer && selectedCheck && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">
                  Distance Traveled: {((formData.checkInOdometer as number) - selectedCheck.checkOutOdometer).toLocaleString()} km
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelLevel">Fuel Level</Label>
                <Select value={formData.fuelLevel || 'Full'} onValueChange={(v) => setFormData({ ...formData, fuelLevel: v })}>
                  <SelectTrigger><SelectValue placeholder="Select fuel level" /></SelectTrigger>
                  <SelectContent>
                    {fuelLevels.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition || 'Good'} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    {conditions.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issues">Issues Reported</Label>
              <Textarea id="issues" value={formData.issues || ''} onChange={(e) => setFormData({ ...formData, issues: e.target.value })} placeholder="Any issues with the vehicle?" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleCheckInSave} disabled={saving} className="bg-green-600 hover:bg-green-700">{saving ? 'Saving...' : 'Check In'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Vehicle Check Details</DialogTitle>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedCheck.vehicle.plateNumber}</h3>
                    <p className="text-sm text-gray-500">{selectedCheck.driver.name}</p>
                  </div>
                </div>
                {getStatusBadge(selectedCheck.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Check Out</p><p className="font-medium">{new Date(selectedCheck.checkOutTime).toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-500">Check In</p><p className="font-medium">{selectedCheck.checkInTime ? new Date(selectedCheck.checkInTime).toLocaleString() : 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Out Odometer</p><p className="font-medium">{selectedCheck.checkOutOdometer.toLocaleString()} km</p></div>
                <div><p className="text-sm text-gray-500">In Odometer</p><p className="font-medium">{selectedCheck.checkInOdometer ? `${selectedCheck.checkInOdometer.toLocaleString()} km` : 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Distance</p><p className="font-medium">{selectedCheck.distanceTraveled !== null ? `${selectedCheck.distanceTraveled.toLocaleString()} km` : 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Fuel Level</p><p className="font-medium">{selectedCheck.fuelLevel || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Condition</p><p className="font-medium">{selectedCheck.condition || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Purpose</p><p className="font-medium">{selectedCheck.purpose || 'N/A'}</p></div>
              </div>
              {selectedCheck.issues && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Issues Reported</h4>
                  <p className="text-gray-600">{selectedCheck.issues}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this vehicle check record?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
