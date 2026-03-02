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
import { Fuel, Plus, Edit, Trash2, Search, Eye, Car, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  fuelType: string;
  quantity: number;
  odometer: number;
  station: string | null;
  receiptNumber: string | null;
  notes: string | null;
  vehicle: { id: string; plateNumber: string; make: string; model: string };
  createdAt: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  status: string;
  mileage: number;
  fuelType: string;
}

const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];

export function FuelModule() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);
  const [formData, setFormData] = useState<Partial<FuelRecord>>({});
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRecords();
    fetchVehicles();
  }, [search]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/fuel?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data || data || []);
      }
    } catch (error) {
      toast.error('Failed to load fuel records');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        setVehicles(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDialog = (record?: FuelRecord) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        ...record,
        date: record.date ? record.date.split('T')[0] : '',
      });
    } else {
      setSelectedRecord(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        quantity: 0,
        odometer: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.vehicleId || !formData.date || !formData.fuelType || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = selectedRecord ? `/api/fuel/${selectedRecord.id}` : '/api/fuel';
      const method = selectedRecord ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (res.ok) {
        toast.success(selectedRecord ? 'Fuel record updated' : 'Fuel record created');
        handleCloseDialog();
        fetchRecords();
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

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      const res = await fetch(`/api/fuel/${selectedRecord.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Fuel record deleted');
        setDeleteDialogOpen(false);
        setSelectedRecord(null);
        fetchRecords();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(records.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Fuel Records</h1>
          <p className="text-gray-600">Track fuel consumption and costs</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Fuel Record
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by vehicle or station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Fuel className="h-12 w-12 mb-4 text-gray-300" />
              <p>No fuel records found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          {record.vehicle.plateNumber}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{record.fuelType}</Badge></TableCell>
                      <TableCell className="font-medium">{record.quantity} L</TableCell>
                      <TableCell>{record.odometer.toLocaleString()} km</TableCell>
                      <TableCell>{record.station || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedRecord(record); setViewDialogOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedRecord(record); setDeleteDialogOpen(true); }} className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, records.length)} of {records.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{currentPage} of {totalPages}</span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit Fuel Record' : 'Add Fuel Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle *</Label>
              <Select value={formData.vehicleId || ''} onValueChange={(v) => {
                const vehicle = vehicles.find(veh => veh.id === v);
                setFormData({ ...formData, vehicleId: v, fuelType: vehicle?.fuelType || 'Petrol', odometer: vehicle?.mileage || 0 });
              }}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select value={formData.fuelType || 'Petrol'} onValueChange={(v) => setFormData({ ...formData, fuelType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (L) *</Label>
                <Input id="quantity" type="number" step="0.01" value={formData.quantity || ''} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometer">Odometer (km)</Label>
                <Input id="odometer" type="number" value={formData.odometer || ''} onChange={(e) => setFormData({ ...formData, odometer: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="station">Station</Label>
                <Input id="station" value={formData.station || ''} onChange={(e) => setFormData({ ...formData, station: e.target.value })} placeholder="Gas station name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt #</Label>
                <Input id="receiptNumber" value={formData.receiptNumber || ''} onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fuel Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Fuel className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold">{selectedRecord.vehicle.plateNumber}</h3>
                  <p className="text-sm text-gray-500">{selectedRecord.quantity} Liters</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Fuel Type</p><p className="font-medium">{selectedRecord.fuelType}</p></div>
                <div><p className="text-sm text-gray-500">Quantity</p><p className="font-medium">{selectedRecord.quantity} L</p></div>
                <div><p className="text-sm text-gray-500">Odometer</p><p className="font-medium">{selectedRecord.odometer.toLocaleString()} km</p></div>
                <div><p className="text-sm text-gray-500">Station</p><p className="font-medium">{selectedRecord.station || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Receipt #</p><p className="font-medium">{selectedRecord.receiptNumber || 'N/A'}</p></div>
              </div>
              {selectedRecord.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fuel Record</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this fuel record?</AlertDialogDescription>
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
