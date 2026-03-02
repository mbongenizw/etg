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
import { Settings, Plus, Edit, Trash2, Search, Eye, Car, Calendar, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ServiceRecord {
  id: string;
  vehicleId: string;
  type: string;
  types: string[];
  description: string;
  startDate: string;
  endDate: string | null;
  odometer: number;
  serviceProvider: string | null;
  status: string;
  priority: string;
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
}

// Service-specific types
const serviceTypes = [
  'Oil Change',
  'Tire Service',
  'Brake Service',
  'Engine Tune-up',
  'Air Filter Replacement',
  'Fluid Top-up',
  'Battery Service',
  'AC Service',
  'Wheel Alignment',
  'Coolant Flush',
  'Transmission Service',
  'Spark Plug Replacement',
  'Fuel Filter Replacement',
  'Timing Belt Replacement',
];

const serviceStatuses = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'IN PROGRESS', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const priorityLevels = [
  { value: 'Low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'Normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export function ServiceModule() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceRecord> & { types: string[] }>({ types: [] });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRecords();
    fetchVehicles();
  }, [statusFilter, search]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/maintenance?${params}`);
      if (res.ok) {
        const data = await res.json();
        // Filter for service types only
        const serviceRecords = data.filter((r: ServiceRecord) => 
          r.types && r.types.some((t: string) => serviceTypes.includes(t))
        );
        setRecords(serviceRecords);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to load service records');
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
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleOpenDialog = (record?: ServiceRecord) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        ...record,
        types: record.types || [],
        startDate: record.startDate ? record.startDate.split('T')[0] : '',
        endDate: record.endDate ? record.endDate.split('T')[0] : '',
      });
    } else {
      setSelectedRecord(null);
      setFormData({
        types: [],
        status: 'SCHEDULED',
        priority: 'Normal',
        odometer: 0,
        startDate: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
    setFormData({ types: [] });
  };

  const toggleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types?.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...(prev.types || []), type]
    }));
  };

  const handleSave = async () => {
    if (!formData.vehicleId || formData.types?.length === 0 || !formData.description || !formData.startDate) {
      toast.error('Please fill in all required fields and select at least one service type');
      return;
    }

    setSaving(true);
    try {
      const url = selectedRecord ? `/api/maintenance/${selectedRecord.id}` : '/api/maintenance';
      const method = selectedRecord ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        toast.success(selectedRecord ? 'Service record updated' : 'Service record created');
        handleCloseDialog();
        fetchRecords();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      const res = await fetch(`/api/maintenance/${selectedRecord.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Service record deleted');
        setDeleteDialogOpen(false);
        setSelectedRecord(null);
        fetchRecords();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = serviceStatuses.find(s => s.value === status);
    return <Badge className={config?.color || 'bg-gray-100'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityLevels.find(p => p.value === priority);
    return <Badge variant="outline" className={config?.color || 'bg-gray-100'}>{priority}</Badge>;
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(records.length / itemsPerPage);

  // Statistics
  const stats = {
    total: records.length,
    scheduled: records.filter(r => r.status === 'SCHEDULED').length,
    inProgress: records.filter(r => r.status === 'IN PROGRESS').length,
    completed: records.filter(r => r.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Service</h1>
          <p className="text-gray-600">Manage vehicle service records (oil changes, tune-ups, etc.)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Settings className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-amber-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Settings className="h-5 w-5 text-orange-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-orange-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Settings className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by description or vehicle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {serviceStatuses.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
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
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Settings className="h-12 w-12 mb-4 text-gray-300" />
              <p>No service records found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Service Types</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-sm">{record.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{record.vehicle.plateNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(record.types || []).slice(0, 2).map((t, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                          {(record.types || []).length > 2 && (
                            <Badge variant="outline" className="text-xs">+{(record.types || []).length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(record.startDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit Service Record' : 'Add Service Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle *</Label>
              <Select value={formData.vehicleId || ''} onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'SCHEDULED'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {serviceStatuses.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Multi-select Service Types */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Service Types * (Select one or more)</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {serviceTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left',
                        formData.types?.includes(type)
                          ? 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'bg-white border-gray-200 hover:border-amber-300'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center',
                        formData.types?.includes(type)
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-gray-300'
                      )}>
                        {formData.types?.includes(type) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="truncate">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              {formData.types && formData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.types.map(type => (
                    <Badge key={type} className="bg-amber-100 text-amber-800">
                      {type}
                      <button
                        type="button"
                        onClick={() => toggleType(type)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Input id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Service description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer (km)</Label>
              <Input id="odometer" type="number" value={formData.odometer || ''} onChange={(e) => setFormData({ ...formData, odometer: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceProvider">Service Provider</Label>
              <Input id="serviceProvider" value={formData.serviceProvider || ''} onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })} placeholder="Service center name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority || 'Normal'} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {priorityLevels.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedRecord.description}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedRecord.types || []).map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(selectedRecord.priority)}
                  {getStatusBadge(selectedRecord.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-medium">{selectedRecord.vehicle.plateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Odometer</p>
                  <p className="font-medium">{selectedRecord.odometer.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{new Date(selectedRecord.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{selectedRecord.endDate ? new Date(selectedRecord.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Provider</p>
                  <p className="font-medium">{selectedRecord.serviceProvider || 'N/A'}</p>
                </div>
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
            <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this service record?</AlertDialogDescription>
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
