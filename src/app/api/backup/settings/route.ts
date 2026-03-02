import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get backup settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    // Get or create default settings
    let settings = await db.backupSettings.findFirst();
    
    if (!settings) {
      settings = await db.backupSettings.create({
        data: {
          enabled: true,
          frequency: 'daily',
          keepCount: 10,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get backup settings error:', error);
    return NextResponse.json({ error: 'Failed to get backup settings' }, { status: 500 });
  }
}

// PUT - Update backup settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const data = await request.json();
    
    // Get existing settings
    let settings = await db.backupSettings.findFirst();
    
    if (!settings) {
      settings = await db.backupSettings.create({
        data: {
          enabled: data.enabled ?? true,
          frequency: data.frequency || 'daily',
          keepCount: data.keepCount || 10,
        },
      });
    } else {
      settings = await db.backupSettings.update({
        where: { id: settings.id },
        data: {
          enabled: data.enabled,
          frequency: data.frequency,
          keepCount: data.keepCount,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update backup settings error:', error);
    return NextResponse.json({ error: 'Failed to update backup settings' }, { status: 500 });
  }
}
