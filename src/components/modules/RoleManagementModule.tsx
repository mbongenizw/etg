'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Search, CheckCircle, Users, UserCheck, Truck, Edit, Save, X, Plus, Trash2, RotateCcw, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface RoleData {
  permissions: string[];
  description?: string;
  isDefault: boolean;
}

const roles = ['Admin', 'Manager', 'User', 'Driver'];
const roleColors: Record<string, string> = {
  Admin: 'bg-red-100 text-red-800 border-red-200',
  Manager: 'bg-amber-100 text-amber-800 border-amber-200',
  User: 'bg-blue-100 text-blue-800 border-blue-200',
  Driver: 'bg-green-100 text-green-800 border-green-200',
};

const roleDescriptions: Record<string, string> = {
  Admin: 'Full system access and control',
  Manager: 'Manage operations and reports',
  User: 'Standard system access',
  Driver: 'Driver-specific access',
};

export function RoleManagementModule() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Record<string, RoleData>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionEditorOpen, setPermissionEditorOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [newPermission, setNewPermission] = useState('');
  const [saving, setSaving] = useState(false);

  // Role statistics
  const roleStats = {
    Admin: users.filter(u => u.role === 'Admin').length,
    Manager: users.filter(u => u.role === 'Manager').length,
    User: users.filter(u => u.role === 'User').length,
    Driver: users.filter(u => u.role === 'Driver').length,
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/permissions');
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        toast.success('Role updated successfully');
        fetchUsers();
        setEditDialogOpen(false);
        setEditingUser(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setEditDialogOpen(true);
  };

  const openPermissionEditor = (role: string) => {
    setEditingRole(role);
    setEditedPermissions(permissions[role]?.permissions || []);
    setPermissionEditorOpen(true);
  };

  const handleAddPermission = () => {
    if (newPermission.trim() && !editedPermissions.includes(newPermission.trim())) {
      setEditedPermissions([...editedPermissions, newPermission.trim()]);
      setNewPermission('');
    }
  };

  const handleRemovePermission = (index: number) => {
    setEditedPermissions(editedPermissions.filter((_, i) => i !== index));
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editingRole,
          permissions: editedPermissions,
        }),
      });

      if (res.ok) {
        toast.success('Permissions updated successfully');
        fetchPermissions();
        setPermissionEditorOpen(false);
        setEditingRole(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update permissions');
      }
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!editingRole) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/permissions?role=${editingRole}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Permissions reset to default');
        fetchPermissions();
        setEditedPermissions(data.permissions);
        setResetDialogOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to reset permissions');
      }
    } catch (error) {
      toast.error('Failed to reset permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase()) ||
                          user.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Shield className="h-5 w-5 text-red-600" />;
      case 'Manager': return <UserCheck className="h-5 w-5 text-amber-600" />;
      case 'User': return <Users className="h-5 w-5 text-blue-600" />;
      case 'Driver': return <Truck className="h-5 w-5 text-green-600" />;
      default: return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-amber-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Roles</p>
                <p className="text-2xl font-bold text-blue-900">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Permissions</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Object.values(permissions).reduce((acc, p) => acc + p.permissions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const roleData = permissions[role] || { permissions: [], isDefault: true };
          return (
            <Card 
              key={role}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === role ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${roleColors[role]}`}>
                      {getRoleIcon(role)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{role}</h3>
                      <p className="text-sm text-gray-500">{roleStats[role]} users</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPermissionEditor(role);
                    }}
                    className="h-8 w-8"
                    title="Edit permissions"
                  >
                    <Edit className="h-4 w-4 text-amber-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mb-2">{roleDescriptions[role]}</p>
                {roleData.isDefault && (
                  <Badge variant="outline" className="text-xs mb-2">Default</Badge>
                )}
                {!roleData.isDefault && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs mb-2">Custom</Badge>
                )}
                <div className="space-y-1">
                  {roleData.permissions.slice(0, 3).map((perm, i) => (
                    <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="truncate">{perm}</span>
                    </p>
                  ))}
                  {roleData.permissions.length > 3 && (
                    <p className="text-xs text-gray-400">+{roleData.permissions.length - 3} more</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => {
                    if (selectedRole === role) {
                      setSelectedRole(null);
                      setRoleFilter('all');
                    } else {
                      setSelectedRole(role);
                      setRoleFilter(role);
                    }
                  }}
                >
                  {selectedRole === role ? 'Show All Users' : 'View Users'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Role Details */}
      {selectedRole && permissions[selectedRole] && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {getRoleIcon(selectedRole)}
                {selectedRole} Role Details
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPermissionEditor(selectedRole)}
                className="text-amber-600 border-amber-200"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Permissions
              </Button>
            </div>
            <CardDescription>
              {roleDescriptions[selectedRole]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">All Permissions</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {permissions[selectedRole].permissions.map((perm, i) => (
                    <p key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {perm}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">Users with this role</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {users.filter(u => u.role === selectedRole).slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || undefined} className="object-cover" />
                        <AvatarFallback className="bg-amber-600 text-white text-xs">
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {users.filter(u => u.role === selectedRole).length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{users.filter(u => u.role === selectedRole).length - 5} more users
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table with Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            User Role Assignment
          </CardTitle>
          <CardDescription>Click on a role badge or edit button to change a user's role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search users..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="h-12 w-12 mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-amber-600 text-white font-bold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={editingUser.avatar || undefined} className="object-cover" />
                  <AvatarFallback className="bg-amber-600 text-white">
                    {editingUser.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{editingUser.fullName}</p>
                  <p className="text-sm text-gray-500">{editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select New Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        newRole === role 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(role)}
                        <span className="font-medium">{role}</span>
                      </div>
                      <p className="text-xs text-gray-500">{roleDescriptions[role]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {newRole && newRole !== editingUser.role && permissions[newRole] && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    Changing from {editingUser.role} to {newRole}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">New permissions:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {permissions[newRole].permissions.map((perm, i) => (
                      <p key={i} className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {perm}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={() => editingUser && handleRoleChange(editingUser.id, newRole)} 
              disabled={saving || newRole === editingUser?.role}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Editor Dialog */}
      <Dialog open={permissionEditorOpen} onOpenChange={setPermissionEditorOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingRole && getRoleIcon(editingRole)}
              Edit {editingRole} Permissions
            </DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Badge className={roleColors[editingRole]}>
                    {editingRole}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">{roleDescriptions[editingRole]}</p>
                </div>
                {permissions[editingRole]?.isDefault === false && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResetDialogOpen(true)}
                    className="text-red-600 border-red-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Add New Permission */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new permission..."
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPermission();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddPermission}
                  disabled={!newPermission.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Permissions List */}
              <div className="space-y-2">
                <Label>Current Permissions ({editedPermissions.length})</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2 bg-gray-50">
                  {editedPermissions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No permissions defined</p>
                  ) : (
                    editedPermissions.map((perm, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm truncate">{perm}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePermission(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Add Suggestions */}
              <div>
                <Label className="text-xs text-gray-500">Quick Add:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['View all data', 'Create records', 'Edit records', 'Delete records', 'Export reports', 'Manage settings'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        if (!editedPermissions.includes(suggestion)) {
                          setEditedPermissions([...editedPermissions, suggestion]);
                        }
                      }}
                      disabled={editedPermissions.includes(suggestion)}
                    >
                      + {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionEditorOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={handleSavePermissions}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Permissions Confirmation */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Permissions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset {editingRole} permissions to default? This will remove all custom permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPermissions}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset to Default
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
