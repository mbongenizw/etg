import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const targetUser = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (required in Next.js 15+)
    const { id } = await params;
    
    const user = await getCurrentUser();
    if (!user) {
      console.log('PUT /api/users: No user found in session');
      return NextResponse.json({ error: 'Unauthorized - Please login again' }, { status: 401 });
    }

    console.log('PUT /api/users:', { targetId: id, currentUserId: user.id, userRole: user.role });

    const data = await request.json();

    // Allow users to update their own profile, or admin to update any profile
    const isOwnProfile = id === user.id;
    const isAdmin = user.role === 'Admin';

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own profile' }, { status: 403 });
    }

    // Only admin can change role
    if (data.role && !isAdmin) {
      delete data.role;
    }

    // Only admin can change isActive status
    if (data.isActive !== undefined && !isAdmin) {
      delete data.isActive;
    }

    // Check for existing username/email (excluding current user)
    if (data.username) {
      const existingUsername = await db.user.findFirst({
        where: {
          username: data.username,
          id: { not: id },
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
    }

    if (data.email) {
      const existingEmail = await db.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    // Only include fields that are provided
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    // Only admin can update these fields
    if (isAdmin) {
      if (data.role !== undefined) updateData.role = data.role;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
    }

    // Only update password if provided
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    console.log('Updating user with data:', { id, updateData: { ...updateData, password: data.password ? '[REDACTED]' : undefined } });

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
