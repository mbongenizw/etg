'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, RefreshCw, Home, CheckCircle, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const isMounted = useRef(true);

  // Check server connection
  const checkConnection = useCallback(async () => {
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
  }, []);

  // Handle retry
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setServerStatus('checking');
    
    const isConnected = await checkConnection();
    
    if (!isMounted.current) return;
    
    if (isConnected) {
      setServerStatus('online');
      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } else {
      setServerStatus('offline');
      setIsRetrying(false);
    }
  }, [checkConnection]);

  // Handle go home
  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  // Initial check on mount
  useEffect(() => {
    isMounted.current = true;
    
    const doInitialCheck = async () => {
      const isConnected = await checkConnection();
      if (!isMounted.current) return;
      
      if (isConnected) {
        setServerStatus('online');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setServerStatus('offline');
      }
    };
    
    doInitialCheck();
    
    return () => {
      isMounted.current = false;
    };
  }, [checkConnection]);

  // Auto-retry every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const isConnected = await checkConnection();
      if (!isMounted.current) return;
      
      if (isConnected) {
        setServerStatus('online');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-800 to-amber-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-amber-700 bg-amber-50">
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-amber-800 shadow-lg">
              <Image
                src="/logo.png"
                alt="ETG Logo"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              serverStatus === 'online' 
                ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                : serverStatus === 'checking'
                  ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                  : 'bg-gradient-to-br from-red-100 to-orange-100'
            }`}>
              {serverStatus === 'online' ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : serverStatus === 'checking' ? (
                <RefreshCw className="h-12 w-12 text-amber-600 animate-spin" />
              ) : (
                <WifiOff className="h-12 w-12 text-red-500 animate-pulse" />
              )}
            </div>
            {serverStatus === 'offline' && (
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Title & Message */}
          <h1 className="text-2xl font-bold text-amber-900 mb-2">
            {serverStatus === 'online' ? 'Connection Restored!' : 'Connection Issue'}
          </h1>
          <p className="text-amber-700 mb-6">
            {serverStatus === 'online' 
              ? 'Your connection has been restored. Redirecting...'
              : 'Unable to connect to the ETG Fleet Management server. Please check your connection and try again.'
            }
          </p>

          {/* Status Card */}
          <div className={`rounded-lg p-4 mb-6 border ${
            serverStatus === 'online' 
              ? 'bg-green-100 border-green-200' 
              : serverStatus === 'checking'
                ? 'bg-yellow-100 border-yellow-200'
                : 'bg-red-100 border-red-200'
          }`}>
            <div className={`flex items-center justify-center gap-2 ${
              serverStatus === 'online' 
                ? 'text-green-800' 
                : serverStatus === 'checking'
                  ? 'text-yellow-800'
                  : 'text-red-800'
            }`}>
              {serverStatus === 'online' ? (
                <CheckCircle className="h-4 w-4" />
              ) : serverStatus === 'checking' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {serverStatus === 'checking' 
                  ? 'Checking connection...' 
                  : serverStatus === 'online' 
                    ? 'Server Online' 
                    : 'Server Unreachable'
                }
              </span>
            </div>
            {retryCount > 0 && serverStatus === 'offline' && (
              <p className="text-xs text-red-600 mt-2">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying || serverStatus === 'online' || serverStatus === 'checking'}
              className={`w-full text-white ${
                serverStatus === 'online'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isRetrying || serverStatus === 'checking' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : serverStatus === 'online' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Connected - Redirecting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-amber-600 mt-6">
            Auto-checking every 10 seconds...
            <br />
            If problem persists, contact IT support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
