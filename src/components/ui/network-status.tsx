'use client';

import React, { useEffect, useCallback, useSyncExternalStore, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Custom hook for online status
function useOnlineStatus() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }, []);
  
  const getServerSnapshot = useCallback(() => true, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Check if server is actually reachable
async function checkServerConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/health', { 
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export function NetworkStatusHandler() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const pathname = usePathname();
  const hasShownOfflineToast = useRef(false);

  // Handle online/offline status changes
  useEffect(() => {
    if (isOnline) {
      // Reset the toast flag when back online
      hasShownOfflineToast.current = false;
      
      // Only show toast if we were previously on offline page
      if (pathname === '/offline') {
        toast.success('Connection restored!', {
          description: 'You are back online.',
          icon: <Wifi className="h-5 w-5 text-green-500" />,
          duration: 3000,
        });
        router.push('/');
      }
    }
  }, [isOnline, pathname, router]);

  // Don't render anything visible, just handle the events
  return null;
}

// Standalone offline banner component - only shows when truly offline
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Only show banner after a delay to avoid flickering
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isOnline) {
      // Wait 2 seconds before showing the banner
      timeout = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    } else {
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => setShowBanner(false));
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOnline]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    const connected = await checkServerConnection();
    if (connected) {
      window.location.reload();
    } else {
      setIsRetrying(false);
    }
  }, []);

  // Don't show banner if browser reports online
  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg">
      <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
      <span className="text-sm font-medium">Connection issue detected</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetry}
        disabled={isRetrying}
        className="h-7 bg-white/20 border-white/30 text-white hover:bg-white/30"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  );
}
