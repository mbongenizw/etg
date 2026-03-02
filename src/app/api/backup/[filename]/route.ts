import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteBackup, restoreBackup } from '@/lib/backup';

// DELETE - Delete a backup
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    const deleted = deleteBackup(decodedFilename);

    if (deleted) {
      return NextResponse.json({ success: true, message: 'Backup deleted' });
    } else {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete backup error:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}

// POST - Restore from a backup
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    const restored = restoreBackup(decodedFilename);

    if (restored) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database restored successfully. Please restart the application for changes to take effect.' 
      });
    } else {
      return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
    }
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}
