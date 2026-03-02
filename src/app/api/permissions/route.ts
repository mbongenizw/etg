import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Default permissions for each role
const defaultPermissions: Record<string, string[]> = {
  Admin: [
    'Manage all users',
    'Full access to all modules',
    'System configuration',
    'Delete any record',
    'Manage roles and permissions',
    'Access all reports',
    'Manage vehicles and drivers',
    'View and edit all trips',
    'Manage maintenance schedules',
    'View financial reports',
  ],
  Manager: [
    'Manage vehicles and drivers',
    'View all reports',
    'Approve requests',
    'Manage trips',
    'Manage maintenance schedules',
    'View financial reports',
    'Create and edit records',
    'Export reports',
  ],
  User: [
    'View vehicles and drivers',
    'Create trip requests',
    'View own profile',
    'Basic reporting',
    'Submit fuel records',
    'View schedules',
  ],
  Driver: [
    'View assigned vehicle',
    'Check in/out vehicles',
    'Report incidents',
    'View own trips',
    'Submit vehicle check reports',
    'View personal schedule',
  ],
};

// GET - Fetch all permissions or specific role permissions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (role) {
      // Fetch permissions for specific role
      const rolePermission = await db.rolePermission.findUnique({
        where: { role },
      });

      if (rolePermission) {
        return NextResponse.json({
          role: rolePermission.role,
          permissions: JSON.parse(rolePermission.permissions),
          description: rolePermission.description,
        });
      }

      // Return default permissions if not customized
      return NextResponse.json({
        role,
        permissions: defaultPermissions[role] || [],
        isDefault: true,
      });
    }

    // Fetch all permissions
    const savedPermissions = await db.rolePermission.findMany();
    const permissionsMap: Record<string, { permissions: string[]; description?: string; isDefault: boolean }> = {};

    // Initialize with all roles
    const roles = ['Admin', 'Manager', 'User', 'Driver'];
    for (const r of roles) {
      const saved = savedPermissions.find(p => p.role === r);
      if (saved) {
        permissionsMap[r] = {
          permissions: JSON.parse(saved.permissions),
          description: saved.description || undefined,
          isDefault: false,
        };
      } else {
        permissionsMap[r] = {
          permissions: defaultPermissions[r] || [],
          isDefault: true,
        };
      }
    }

    return NextResponse.json(permissionsMap);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

// PUT - Update permissions for a role
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, permissions, description } = body;

    if (!role || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['Admin', 'Manager', 'User', 'Driver'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update or create permissions
    const rolePermission = await db.rolePermission.upsert({
      where: { role },
      update: {
        permissions: JSON.stringify(permissions),
        description: description || null,
      },
      create: {
        role,
        permissions: JSON.stringify(permissions),
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      role: rolePermission.role,
      permissions: JSON.parse(rolePermission.permissions),
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}

// DELETE - Reset permissions to default
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    await db.rolePermission.delete({
      where: { role },
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions reset to default',
      permissions: defaultPermissions[role] || [],
    });
  } catch (error) {
    console.error('Error resetting permissions:', error);
    return NextResponse.json({ error: 'Failed to reset permissions' }, { status: 500 });
  }
}
