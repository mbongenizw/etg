'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database, Download, Trash2, RefreshCw, Settings, Clock, HardDrive, 
  AlertTriangle, CheckCircle, Calendar, ChevronLeft, ChevronRight, 
  Archive, Shield, Info
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  createdAtFormatted: string;
  type: 'manual' | 'auto';
}

interface BackupStats {
  size: number;
  sizeFormatted: string;
  lastBackup: string | null;
  totalBackups: number;
  backupSize: number;
  backupSizeFormatted: string;
}

interface BackupSettings {
  id: string;
  enabled: boolean;
  frequency: string;
  keepCount: number;
  lastBackupAt: string | null;
  nextBackupAt: string | null;
}

export function SettingsModule() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState<BackupInfo | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<BackupInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
        setStats(data.stats || null);
        setSettings(data.settings || null);
      }
    } catch (error) {
      toast.error('Failed to load backup data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' }),
      });

      if (res.ok) {
        toast.success('Backup created successfully');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create backup');
      }
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreDialog) return;

    try {
      const res = await fetch(`/api/backup/${encodeURIComponent(restoreDialog.filename)}`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Database restored successfully. Please refresh the page.');
        setRestoreDialog(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to restore backup');
      }
    } catch (error) {
      toast.error('Failed to restore backup');
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteDialog) return;

    try {
      const res = await fetch(`/api/backup/${encodeURIComponent(deleteDialog.filename)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Backup deleted successfully');
        setDeleteDialog(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete backup');
      }
    } catch (error) {
      toast.error('Failed to delete backup');
    }
  };

  const handleUpdateSettings = async (updates: Partial<BackupSettings>) => {
    try {
      const res = await fetch('/api/backup/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        toast.success('Settings updated');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const paginatedBackups = backups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(backups.length / itemsPerPage);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Settings</h1>
          <p className="text-gray-600">Manage system settings and backups</p>
        </div>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Database className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Database Size</p>
                <p className="text-xl font-bold text-amber-900">{stats?.sizeFormatted || '0 Bytes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Archive className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Backups</p>
                <p className="text-xl font-bold text-blue-900">{stats?.totalBackups || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <HardDrive className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Backup Storage</p>
                <p className="text-xl font-bold text-green-900">{stats?.backupSizeFormatted || '0 Bytes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Backup</p>
                <p className="text-sm font-bold text-purple-900 truncate">
                  {stats?.lastBackup ? formatDate(stats.lastBackup) : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-600" />
            Automatic Backup Settings
          </CardTitle>
          <CardDescription>
            Configure automatic database backup schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Automatic Backups</Label>
              <p className="text-sm text-gray-500">
                Automatically create database backups on a schedule
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={settings?.enabled ?? true}
              onCheckedChange={(checked) => handleUpdateSettings({ enabled: checked })}
            />
          </div>

          {/* Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Backup Frequency</Label>
              <Select
                value={settings?.frequency || 'daily'}
                onValueChange={(value) => handleUpdateSettings({ frequency: value })}
                disabled={!settings?.enabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keepCount">Backups to Keep</Label>
              <Input
                id="keepCount"
                type="number"
                min={1}
                max={100}
                value={settings?.keepCount || 10}
                onChange={(e) => handleUpdateSettings({ keepCount: parseInt(e.target.value) || 10 })}
              />
              <p className="text-xs text-gray-500">Older backups will be automatically deleted</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Automatic Backup Info</p>
              <p>Automatic backups run in the background. The next backup will be scheduled based on your selected frequency. You can always create manual backups using the button below.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-amber-600" />
            Manual Backup
          </CardTitle>
          <CardDescription>
            Create a backup of your database right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreateBackup} 
            disabled={creating}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {creating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Create Backup Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-amber-600" />
            Backup History
          </CardTitle>
          <CardDescription>
            View and manage your database backups
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Archive className="h-12 w-12 mb-4 text-gray-300" />
              <p>No backups found</p>
              <p className="text-sm">Create your first backup above</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBackups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">{backup.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={backup.type === 'auto' ? 'default' : 'outline'}>
                          {backup.type === 'auto' ? (
                            <><Clock className="h-3 w-3 mr-1" /> Auto</>
                          ) : (
                            <><Download className="h-3 w-3 mr-1" /> Manual</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{backup.sizeFormatted}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {backup.createdAtFormatted}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoreDialog(backup)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog(backup)}
                            className="text-red-600 hover:text-red-700"
                          >
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, backups.length)} of {backups.length} backups
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{currentPage} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreDialog} onOpenChange={() => setRestoreDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Restore Database
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current database with the backup from <strong>{restoreDialog?.createdAtFormatted}</strong>.
              <br /><br />
              A backup of your current database will be created before restoring. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRestoreBackup}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restore Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Backup
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.filename}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBackup}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-900">Reset Database</p>
              <p className="text-sm text-red-700">Delete all data and start fresh</p>
            </div>
            <Button variant="destructive" disabled>
              Reset Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
