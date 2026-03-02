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
import { Bell, Plus, Edit, Trash2, Search, Eye, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Reminder {
  id: string;
  type: string;
  title: string;
  description: string | null;
  vehicleId: string | null;
  driverId: string | null;
  dueDate: string;
  reminderDate: string | null;
  priority: string;
  isRecurring: boolean;
  recurrenceType: string | null;
  recurrenceValue: number | null;
  status: string;
  notes: string | null;
  vehicle: { id: string; plateNumber: string } | null;
  driver: { id: string; name: string } | null;
  createdAt: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
}

interface Driver {
  id: string;
  name: string;
}

const reminderTypes = ['Service', 'Insurance', 'License', 'Inspection', 'Registration', 'Custom'];
const reminderStatuses = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'DISMISSED', label: 'Dismissed', color: 'bg-gray-100 text-gray-800' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-800' },
];
const priorityLevels = [
  { value: 'Low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'Normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];
const recurrenceTypes = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export function RemindersModule() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<Partial<Reminder>>({});
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReminders();
    fetchVehicles();
    fetchDrivers();
  }, [statusFilter, search]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/reminders?${params}`);
      if (res.ok) setReminders(await res.json());
    } catch (error) {
      toast.error('Failed to load reminders');
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

  const handleOpenDialog = (reminder?: Reminder) => {
    if (reminder) {
      setSelectedReminder(reminder);
      setFormData({
        ...reminder,
        dueDate: reminder.dueDate ? reminder.dueDate.split('T')[0] : '',
        reminderDate: reminder.reminderDate ? reminder.reminderDate.split('T')[0] : '',
      });
    } else {
      setSelectedReminder(null);
      setFormData({
        type: 'Service',
        priority: 'Normal',
        status: 'PENDING',
        isRecurring: false,
        dueDate: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReminder(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.type || !formData.title || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = selectedReminder ? `/api/reminders/${selectedReminder.id}` : '/api/reminders';
      const method = selectedReminder ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: new Date(formData.dueDate).toISOString(),
          reminderDate: formData.reminderDate ? new Date(formData.reminderDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        toast.success(selectedReminder ? 'Reminder updated' : 'Reminder created');
        handleCloseDialog();
        fetchReminders();
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
    if (!selectedReminder) return;
    try {
      const res = await fetch(`/api/reminders/${selectedReminder.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Reminder deleted');
        setDeleteDialogOpen(false);
        setSelectedReminder(null);
        fetchReminders();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleComplete = async (reminder: Reminder) => {
    try {
      const res = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reminder, status: 'COMPLETED' }),
      });
      if (res.ok) {
        toast.success('Reminder marked as completed');
        fetchReminders();
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = reminderStatuses.find(s => s.value === status);
    return <Badge className={config?.color || 'bg-gray-100'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityLevels.find(p => p.value === priority);
    return <Badge variant="outline" className={config?.color || 'bg-gray-100'}>{priority}</Badge>;
  };

  const paginatedReminders = reminders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(reminders.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Reminders</h1>
          <p className="text-gray-600">Manage alerts and notifications</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search reminders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {reminderStatuses.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
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
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="h-12 w-12 mb-4 text-gray-300" />
              <p>No reminders found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reminder</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-amber-500" />
                          <div>
                            <p className="font-medium text-sm">{reminder.title}</p>
                            {reminder.vehicle && <p className="text-xs text-gray-500">{reminder.vehicle.plateNumber}</p>}
                            {reminder.driver && <p className="text-xs text-gray-500">{reminder.driver.name}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{reminder.type}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(reminder.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(reminder.priority)}</TableCell>
                      <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {reminder.status === 'PENDING' && (
                            <Button variant="ghost" size="icon" onClick={() => handleComplete(reminder)} className="text-green-600">
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedReminder(reminder); setViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(reminder)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedReminder(reminder); setDeleteDialogOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, reminders.length)} of {reminders.length}</p>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedReminder ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Reminder title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type || 'Service'} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority || 'Normal'} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" value={formData.dueDate || ''} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderDate">Reminder Date</Label>
                <Input id="reminderDate" type="date" value={formData.reminderDate || ''} onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select value={formData.vehicleId || 'none'} onValueChange={(v) => setFormData({ ...formData, vehicleId: v === 'none' ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {vehicles.map(v => (<SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver</Label>
                <Select value={formData.driverId || 'none'} onValueChange={(v) => setFormData({ ...formData, driverId: v === 'none' ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {drivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="isRecurring" checked={formData.isRecurring || false} onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })} className="rounded" />
                <Label htmlFor="isRecurring">Recurring Reminder</Label>
              </div>
              {formData.isRecurring && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceType">Recurrence Type</Label>
                    <Select value={formData.recurrenceType || 'Monthly'} onValueChange={(v) => setFormData({ ...formData, recurrenceType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {recurrenceTypes.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceValue">Every</Label>
                    <Input id="recurrenceValue" type="number" value={formData.recurrenceValue || 1} onChange={(e) => setFormData({ ...formData, recurrenceValue: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
              )}
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
            <DialogTitle>Reminder Details</DialogTitle>
          </DialogHeader>
          {selectedReminder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedReminder.title}</h3>
                    <p className="text-sm text-gray-500">{selectedReminder.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(selectedReminder.priority)}
                  {getStatusBadge(selectedReminder.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{new Date(selectedReminder.dueDate).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Reminder Date</p><p className="font-medium">{selectedReminder.reminderDate ? new Date(selectedReminder.reminderDate).toLocaleDateString() : 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Vehicle</p><p className="font-medium">{selectedReminder.vehicle?.plateNumber || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Driver</p><p className="font-medium">{selectedReminder.driver?.name || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Recurring</p><p className="font-medium">{selectedReminder.isRecurring ? `Yes (${selectedReminder.recurrenceType})` : 'No'}</p></div>
              </div>
              {selectedReminder.description && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedReminder.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this reminder?</AlertDialogDescription>
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
