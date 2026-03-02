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
import { AlertTriangle, Plus, Edit, Trash2, Search, Eye, Car, Users, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Incident {
  id: string;
  vehicleId: string;
  driverId: string | null;
  incidentType: string;
  date: string;
  location: string | null;
  description: string;
  severity: string;
  otherParty: string | null;
  otherPartyInsurance: string | null;
  policeReport: string | null;
  damageDescription: string | null;
  breakdownType: string | null;
  towRequired: boolean;
  repairLocation: string | null;
  status: string;
  resolutionDate: string | null;
  resolutionNotes: string | null;
  notes: string | null;
  vehicle: { id: string; plateNumber: string; make: string; model: string };
  driver: { id: string; name: string; employeeId: string } | null;
  createdAt: string;
}

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

const incidentTypes = ['Accident', 'Breakdown', 'Other'];
const breakdownTypes = ['Mechanical', 'Electrical', 'Tire', 'Engine', 'Other'];
const severityLevels = [
  { value: 'Minor', label: 'Minor', color: 'bg-green-100 text-green-800' },
  { value: 'Moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Major', label: 'Major', color: 'bg-orange-100 text-orange-800' },
  { value: 'Critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];
const incidentStatuses = [
  { value: 'OPEN', label: 'Open', color: 'bg-red-100 text-red-800' },
  { value: 'IN PROGRESS', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

export function IncidentsModule() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<Partial<Incident>>({});
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchIncidents();
    fetchVehicles();
    fetchDrivers();
  }, [statusFilter, typeFilter, search]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/incidents?${params}`);
      if (res.ok) {
        setIncidents(await res.json());
      }
    } catch (error) {
      toast.error('Failed to load incidents');
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

  const handleOpenDialog = (incident?: Incident) => {
    if (incident) {
      setSelectedIncident(incident);
      setFormData({
        ...incident,
        date: incident.date ? incident.date.split('T')[0] : '',
        resolutionDate: incident.resolutionDate ? incident.resolutionDate.split('T')[0] : '',
      });
    } else {
      setSelectedIncident(null);
      setFormData({
        incidentType: 'Accident',
        severity: 'Minor',
        status: 'OPEN',
        towRequired: false,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedIncident(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.vehicleId || !formData.incidentType || !formData.description || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = selectedIncident ? `/api/incidents/${selectedIncident.id}` : '/api/incidents';
      const method = selectedIncident ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
          resolutionDate: formData.resolutionDate ? new Date(formData.resolutionDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        toast.success(selectedIncident ? 'Incident updated' : 'Incident created');
        handleCloseDialog();
        fetchIncidents();
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
    if (!selectedIncident) return;
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Incident deleted');
        setDeleteDialogOpen(false);
        setSelectedIncident(null);
        fetchIncidents();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = incidentStatuses.find(s => s.value === status);
    return <Badge className={config?.color || 'bg-gray-100'}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const config = severityLevels.find(s => s.value === severity);
    return <Badge variant="outline" className={config?.color || 'bg-gray-100'}>{severity}</Badge>;
  };

  const paginatedIncidents = incidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(incidents.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Incidents</h1>
          <p className="text-gray-600">Track accidents and breakdowns</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {incidentStatuses.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {incidentTypes.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
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
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertTriangle className="h-12 w-12 mb-4 text-gray-300" />
              <p>No incidents found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`h-4 w-4 ${incident.incidentType === 'Accident' ? 'text-red-500' : 'text-orange-500'}`} />
                          <span className="font-medium text-sm max-w-xs truncate">{incident.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{incident.vehicle.plateNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{incident.incidentType}</Badge></TableCell>
                      <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedIncident(incident); setViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(incident)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedIncident(incident); setDeleteDialogOpen(true); }} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, incidents.length)} of {incidents.length}</p>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedIncident ? 'Edit Incident' : 'Report Incident'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle *</Label>
              <Select value={formData.vehicleId || ''} onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (<SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver</Label>
              <Select value={formData.driverId || 'none'} onValueChange={(v) => setFormData({ ...formData, driverId: v === 'none' ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {drivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incidentType">Type *</Label>
              <Select value={formData.incidentType || 'Accident'} onValueChange={(v) => setFormData({ ...formData, incidentType: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {incidentTypes.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the incident..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Where did it happen?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity || 'Minor'} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                <SelectContent>
                  {severityLevels.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'OPEN'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {incidentStatuses.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {formData.incidentType === 'Accident' && (
              <>
                <div className="space-y-2 sm:col-span-2 border-t pt-4 mt-2">
                  <Label className="text-base font-semibold">Accident Details</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherParty">Other Party</Label>
                  <Input id="otherParty" value={formData.otherParty || ''} onChange={(e) => setFormData({ ...formData, otherParty: e.target.value })} placeholder="Other driver/vehicle info" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherPartyInsurance">Other Party Insurance</Label>
                  <Input id="otherPartyInsurance" value={formData.otherPartyInsurance || ''} onChange={(e) => setFormData({ ...formData, otherPartyInsurance: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policeReport">Police Report #</Label>
                  <Input id="policeReport" value={formData.policeReport || ''} onChange={(e) => setFormData({ ...formData, policeReport: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="damageDescription">Damage Description</Label>
                  <Textarea id="damageDescription" value={formData.damageDescription || ''} onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })} rows={2} />
                </div>
              </>
            )}

            {formData.incidentType === 'Breakdown' && (
              <>
                <div className="space-y-2 sm:col-span-2 border-t pt-4 mt-2">
                  <Label className="text-base font-semibold">Breakdown Details</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakdownType">Breakdown Type</Label>
                  <Select value={formData.breakdownType || ''} onValueChange={(v) => setFormData({ ...formData, breakdownType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {breakdownTypes.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-center gap-2 pt-6">
                  <input type="checkbox" id="towRequired" checked={formData.towRequired || false} onChange={(e) => setFormData({ ...formData, towRequired: e.target.checked })} className="rounded" />
                  <Label htmlFor="towRequired">Tow Required</Label>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="repairLocation">Repair Location</Label>
                  <Input id="repairLocation" value={formData.repairLocation || ''} onChange={(e) => setFormData({ ...formData, repairLocation: e.target.value })} placeholder="Where is it being repaired?" />
                </div>
              </>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea id="resolutionNotes" value={formData.resolutionNotes || ''} onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolutionDate">Resolution Date</Label>
              <Input id="resolutionDate" type="date" value={formData.resolutionDate || ''} onChange={(e) => setFormData({ ...formData, resolutionDate: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedIncident.incidentType === 'Accident' ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <AlertTriangle className={`h-6 w-6 ${selectedIncident.incidentType === 'Accident' ? 'text-red-600' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedIncident.incidentType}</h3>
                    <p className="text-sm text-gray-500">{new Date(selectedIncident.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getSeverityBadge(selectedIncident.severity)}
                  {getStatusBadge(selectedIncident.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Vehicle</p><p className="font-medium">{selectedIncident.vehicle.plateNumber}</p></div>
                <div><p className="text-sm text-gray-500">Driver</p><p className="font-medium">{selectedIncident.driver?.name || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{selectedIncident.location || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Resolution Date</p><p className="font-medium">{selectedIncident.resolutionDate ? new Date(selectedIncident.resolutionDate).toLocaleDateString() : 'N/A'}</p></div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedIncident.description}</p>
              </div>
              {selectedIncident.incidentType === 'Accident' && selectedIncident.damageDescription && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Damage Description</h4>
                  <p className="text-gray-600">{selectedIncident.damageDescription}</p>
                </div>
              )}
              {selectedIncident.resolutionNotes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Resolution Notes</h4>
                  <p className="text-gray-600">{selectedIncident.resolutionNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Incident</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this incident record?</AlertDialogDescription>
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
