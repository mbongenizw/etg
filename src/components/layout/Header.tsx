'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleStore } from '@/stores/moduleStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, LogOut, User, Settings, Menu, Camera, Upload, BellRing, AlertTriangle, Wrench, Car, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const moduleTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicles',
  drivers: 'Drivers',
  maintenance: 'Service & Maintenance',
  fuel: 'Fuel Management',
  incidents: 'Incidents',
  reminders: 'Reminders',
  'vehicle-checks': 'Check Out/In',
  reports: 'Reports',
  users: 'User Management',
};

interface NotificationData {
  counts: {
    pendingReminders: number;
    overdueReminders: number;
    openIncidents: number;
    vehiclesInMaintenance: number;
    scheduledMaintenance: number;
    checkedOutVehicles: number;
    total: number;
  };
  recentReminders: Array<{
    id: string;
    title: string;
    type: string;
    dueDate: string;
    status: string;
    priority: string;
    vehicle?: string;
  }>;
  recentIncidents: Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    severity: string;
    vehicle?: string;
    date: string;
  }>;
}

export function Header() {
  const { user, logout, refreshUser } = useAuth();
  const { activeModule, sidebarCollapsed, setActiveModule, setMobileSidebarOpen } = useModuleStore();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    password: '',
    avatar: user?.avatar || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotificationData(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleProfileOpen = () => {
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      password: '',
      avatar: user?.avatar || '',
    });
    setProfileOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar: '' });
  };

  const handleSaveProfile = async () => {
    if (!formData.fullName) {
      toast.error('Full name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Profile updated successfully');
        refreshUser();
        setProfileOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Manager':
        return 'bg-amber-100 text-amber-800';
      case 'Driver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-600';
      case 'Major':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed right-0 top-0 z-30 h-16 border-b bg-white shadow-sm transition-all duration-300',
          sidebarCollapsed ? 'lg:left-16' : 'lg:left-64',
          'left-0'
        )}
      >
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-amber-900">
                {moduleTitles[activeModule] || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Notifications */}
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {notificationData && notificationData.counts.total > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
                      {notificationData.counts.total > 9 ? '9+' : notificationData.counts.total}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {notificationData && notificationData.counts.total > 0 && (
                    <Badge className="bg-red-100 text-red-800">{notificationData.counts.total} new</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notificationData ? (
                  <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {notificationData.counts.openIncidents > 0 && (
                        <div 
                          className="p-2 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100"
                          onClick={() => { setActiveModule('incidents'); setNotificationOpen(false); }}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">{notificationData.counts.openIncidents}</span>
                          </div>
                          <p className="text-xs text-red-600">Open Incidents</p>
                        </div>
                      )}
                      {notificationData.counts.overdueReminders > 0 && (
                        <div 
                          className="p-2 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100"
                          onClick={() => { setActiveModule('reminders'); setNotificationOpen(false); }}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">{notificationData.counts.overdueReminders}</span>
                          </div>
                          <p className="text-xs text-orange-600">Overdue Reminders</p>
                        </div>
                      )}
                      {notificationData.counts.vehiclesInMaintenance > 0 && (
                        <div 
                          className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer hover:bg-yellow-100"
                          onClick={() => { setActiveModule('maintenance'); setNotificationOpen(false); }}
                        >
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">{notificationData.counts.vehiclesInMaintenance}</span>
                          </div>
                          <p className="text-xs text-yellow-600">In Maintenance</p>
                        </div>
                      )}
                      {notificationData.counts.checkedOutVehicles > 0 && (
                        <div 
                          className="p-2 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100"
                          onClick={() => { setActiveModule('vehicle-checks'); setNotificationOpen(false); }}
                        >
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">{notificationData.counts.checkedOutVehicles}</span>
                          </div>
                          <p className="text-xs text-blue-600">Checked Out</p>
                        </div>
                      )}
                    </div>

                    {/* Recent Reminders */}
                    {notificationData.recentReminders.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-gray-500">UPCOMING REMINDERS</DropdownMenuLabel>
                        {notificationData.recentReminders.slice(0, 3).map((reminder) => (
                          <DropdownMenuItem 
                            key={reminder.id}
                            className="flex flex-col items-start py-2 cursor-pointer"
                            onClick={() => { setActiveModule('reminders'); setNotificationOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <BellRing className={cn("h-4 w-4", getPriorityColor(reminder.priority))} />
                              <span className="font-medium text-sm">{reminder.title}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{reminder.type}</span>
                              {reminder.vehicle && <span>• {reminder.vehicle}</span>}
                              <span>• Due: {new Date(reminder.dueDate).toLocaleDateString()}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    {/* Recent Incidents */}
                    {notificationData.recentIncidents.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-gray-500">RECENT INCIDENTS</DropdownMenuLabel>
                        {notificationData.recentIncidents.slice(0, 3).map((incident) => (
                          <DropdownMenuItem 
                            key={incident.id}
                            className="flex flex-col items-start py-2 cursor-pointer"
                            onClick={() => { setActiveModule('incidents'); setNotificationOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={cn("h-4 w-4", getSeverityColor(incident.severity))} />
                              <span className="font-medium text-sm">{incident.type}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span className="truncate max-w-[200px]">{incident.description}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {incident.vehicle && <span>{incident.vehicle}</span>}
                              <span>• {new Date(incident.date).toLocaleDateString()}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    {notificationData.counts.total === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-amber-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-amber-600 text-white">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.fullName}</span>
                    <Badge className={`text-xs ${getRoleBadgeColor(user?.role || 'User')}`}>
                      {user?.role}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileOpen}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-amber-100">
                  <AvatarImage src={formData.avatar || undefined} className="object-cover" />
                  <AvatarFallback className="bg-amber-600 text-white text-2xl">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 text-white" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload Photo
                </Button>
                {formData.avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500">Max file size: 2MB</p>
            </div>

            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={user?.username || ''} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role || ''} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900">Account Settings</h4>
              <p className="text-sm text-amber-700 mt-1">
                Manage your account preferences and notifications.
              </p>
              <Button 
                variant="outline" 
                className="mt-3 border-amber-300"
                onClick={() => {
                  setSettingsOpen(false);
                  setActiveModule('users');
                }}
              >
                Manage Users
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900">System Information</h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Version: 1.0.0</p>
                <p>Developer: Tinotenda</p>
                <p>© 2026 ETG Agri Inputs</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
