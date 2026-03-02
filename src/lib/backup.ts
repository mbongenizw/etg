import fs from 'fs';
import path from 'path';

const DB_PATH = '/home/z/my-project/db/custom.db';
const BACKUP_DIR = '/home/z/my-project/db/backups';

// Ensure backup directory exists
export function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Get backup file info
export interface BackupInfo {
  id: string;
  filename: string;
  path: string;
  size: number;
  sizeFormatted: string;
  createdAt: Date;
  createdAtFormatted: string;
  type: 'manual' | 'auto';
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Create a backup
export function createBackup(type: 'manual' | 'auto' = 'manual'): BackupInfo {
  ensureBackupDir();

  // Check if database exists
  if (!fs.existsSync(DB_PATH)) {
    throw new Error('Database file not found');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${type}_${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, filename);

  // Copy the database file
  fs.copyFileSync(DB_PATH, backupPath);

  const stats = fs.statSync(backupPath);
  const createdAt = new Date();

  return {
    id: filename.replace('.db', ''),
    filename,
    path: backupPath,
    size: stats.size,
    sizeFormatted: formatBytes(stats.size),
    createdAt,
    createdAtFormatted: formatDate(createdAt),
    type,
  };
}

// List all backups
export function listBackups(): BackupInfo[] {
  ensureBackupDir();

  const files = fs.readdirSync(BACKUP_DIR);
  const backups: BackupInfo[] = [];

  for (const file of files) {
    if (file.endsWith('.db') && file.startsWith('backup_')) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      const createdAt = stats.mtime;
      const type = file.includes('_auto_') ? 'auto' : 'manual';

      backups.push({
        id: file.replace('.db', ''),
        filename: file,
        path: filePath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        createdAt,
        createdAtFormatted: formatDate(createdAt),
        type,
      });
    }
  }

  // Sort by creation date, newest first
  return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Delete a backup
export function deleteBackup(filename: string): boolean {
  const backupPath = path.join(BACKUP_DIR, filename);

  // Security check - only allow deleting backup files
  if (!filename.startsWith('backup_') || !filename.endsWith('.db')) {
    throw new Error('Invalid backup filename');
  }

  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
    return true;
  }

  return false;
}

// Restore from backup
export function restoreBackup(filename: string): boolean {
  const backupPath = path.join(BACKUP_DIR, filename);

  // Security check
  if (!filename.startsWith('backup_') || !filename.endsWith('.db')) {
    throw new Error('Invalid backup filename');
  }

  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file not found');
  }

  // Create a backup of current database before restore
  if (fs.existsSync(DB_PATH)) {
    const preRestoreBackup = path.join(BACKUP_DIR, `pre_restore_${Date.now()}.db`);
    fs.copyFileSync(DB_PATH, preRestoreBackup);
  }

  // Restore the backup
  fs.copyFileSync(backupPath, DB_PATH);

  return true;
}

// Clean old backups (keep only N most recent)
export function cleanOldBackups(keepCount: number): number {
  ensureBackupDir();

  const backups = listBackups();
  let deleted = 0;

  // Delete oldest backups that exceed keepCount
  if (backups.length > keepCount) {
    const toDelete = backups.slice(keepCount);
    for (const backup of toDelete) {
      try {
        deleteBackup(backup.filename);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete backup ${backup.filename}:`, error);
      }
    }
  }

  return deleted;
}

// Get database stats
export function getDatabaseStats(): {
  size: number;
  sizeFormatted: string;
  lastBackup: Date | null;
  totalBackups: number;
  backupSize: number;
  backupSizeFormatted: string;
} {
  ensureBackupDir();

  // Database size
  let dbSize = 0;
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    dbSize = stats.size;
  }

  // Backup stats
  const backups = listBackups();
  const totalBackupSize = backups.reduce((sum, b) => sum + b.size, 0);
  const lastBackup = backups.length > 0 ? backups[0].createdAt : null;

  return {
    size: dbSize,
    sizeFormatted: formatBytes(dbSize),
    lastBackup,
    totalBackups: backups.length,
    backupSize: totalBackupSize,
    backupSizeFormatted: formatBytes(totalBackupSize),
  };
}
