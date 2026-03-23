'use client';

/**
 * ==================== ANALYTICS TRACKER ====================
 * Lightweight, privacy-friendly page view tracking
 * 
 * Einbinden in: frontend-public/src/app/[tenant]/layout.tsx
 * 
 * <AnalyticsTracker tenantSlug={tenant} />
 * 
 * Features:
 * - Kein Cookie, kein localStorage (DSGVO-konform)
 * - Session-ID basiert auf Random ID (nur In-Memory)
 * - Automatisches Page View Tracking bei Navigation
 * - Verweildauer-Tracking via sendBeacon
 * - < 1KB gzipped
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsTrackerProps {
  tenantSlug: string;
  apiUrl?: string;
}

export default function AnalyticsTracker({ tenantSlug, apiUrl }: AnalyticsTrackerProps) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>('');
  const pageStartRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>('');

  // Generate session ID once (in-memory only, lost on tab close)
  useEffect(() => {
    sessionIdRef.current = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }, []);

  // Track page view on route change
  useEffect(() => {
    if (!tenantSlug || !pathname) return;
    if (pathname === lastPathRef.current) return;

    // Send duration for previous page
    if (lastPathRef.current && sessionIdRef.current) {
      sendDuration(tenantSlug, sessionIdRef.current, lastPathRef.current, pageStartRef.current, apiUrl);
    }

    lastPathRef.current = pathname;
    pageStartRef.current = Date.now();

    // Track new page view
    trackPageView(tenantSlug, pathname, sessionIdRef.current, apiUrl);
  }, [pathname, tenantSlug, apiUrl]);

  // Send duration on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (lastPathRef.current && sessionIdRef.current) {
        sendDuration(tenantSlug, sessionIdRef.current, lastPathRef.current, pageStartRef.current, apiUrl);
      }
    };

    // visibilitychange is more reliable than beforeunload on mobile
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [tenantSlug, apiUrl]);

  // Render nothing
  return null;
}

// ========== TRACKING FUNCTIONS ==========

function trackPageView(
  tenantSlug: string,
  path: string,
  sessionId: string,
  apiUrl?: string,
): void {
  const url = `${apiUrl || getApiUrl()}/api/analytics/${tenantSlug}/track`;

  // Use fetch with keepalive for reliability
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: cleanPath(path),
        referrer: document.referrer || undefined,
        sessionId,
      }),
      keepalive: true,
    }).catch(() => {
      // Silent fail - analytics should never break the site
    });
  } catch {
    // Silent fail
  }
}

function sendDuration(
  tenantSlug: string,
  sessionId: string,
  path: string,
  startTime: number,
  apiUrl?: string,
): void {
  const duration = Math.round((Date.now() - startTime) / 1000);
  if (duration < 1 || duration > 3600) return; // Skip invalid durations

  const url = `${apiUrl || getApiUrl()}/api/analytics/${tenantSlug}/duration`;
  const payload = JSON.stringify({
    sessionId,
    path: cleanPath(path),
    duration,
  });

  // Prefer sendBeacon (works on page unload)
  if (navigator.sendBeacon) {
    try {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      return;
    } catch {
      // Fallback to fetch
    }
  }

  // Fallback: fetch with keepalive
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silent fail
  }
}

// ========== HELPERS ==========

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

/** Remove tenant slug prefix from path */
function cleanPath(path: string): string {
  // Remove leading /{tenant}/ prefix for cleaner analytics
  const parts = path.split('/').filter(Boolean);
  if (parts.length > 1) {
    return '/' + parts.slice(1).join('/');
  }
  return path || '/';
}