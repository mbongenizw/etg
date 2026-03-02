import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  createBackup, 
  listBackups, 
  getDatabaseStats, 
  cleanOldBackups
} from '@/lib/backup';

// GET - List all backups and stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const backups = listBackups();
    const stats = getDatabaseStats();
    
    // Get backup settings
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

    return NextResponse.json({
      backups,
      stats,
      settings,
    });
  } catch (error) {
    console.error('Get backups error:', error);
    return NextResponse.json({ error: 'Failed to get backups' }, { status: 500 });
  }
}

// POST - Create a new backup
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const data = await request.json();
    const type = data.type === 'auto' ? 'auto' : 'manual';

    // Get settings
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

    const keepCount = data.keepCount || settings.keepCount || 10;

    // Create backup
    const backup = createBackup(type);

    // Save to backup history
    await db.backupHistory.create({
      data: {
        filename: backup.filename,
        size: backup.size,
        type: type,
        status: 'success',
      },
    });

    // Update backup settings with last backup time
    await db.backupSettings.update({
      where: { id: settings.id },
      data: {
        lastBackupAt: new Date(),
      },
    });

    // Clean old backups
    const deleted = cleanOldBackups(keepCount);

    return NextResponse.json({
      success: true,
      backup,
      deletedCount: deleted,
    });
  } catch (error) {
    console.error('Create backup error:', error);
    
    // Log failed backup
    try {
      await db.backupHistory.create({
        data: {
          filename: 'failed',
          size: 0,
          type: 'manual',
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log backup error:', logError);
    }

    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
