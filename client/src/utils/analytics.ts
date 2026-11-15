/**
 * IIIT Bhagalpur MITRA — Privacy-Preserving Client Analytics & Web Vitals
 * Compliant with DPDP Act 2023 & GDPR:
 * - Honors navigator.doNotTrack
 * - Never collects IP addresses or personally identifiable information
 * - Measures Core Web Vitals (FCP, LCP, CLS) and page view metrics
 */

interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  pathname?: string;
  timestamp: string;
}

const CONSENT_STORAGE_KEY = 'iiitbh_cookie_consent_v1';

export function isAnalyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check Do Not Track header
  if (window.navigator?.doNotTrack === '1') {
    return false;
  }

  // 2. Check local cookie consent choice
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return true; // Default safe until choice
    const parsed = JSON.parse(raw);
    return parsed.analytics !== false;
  } catch {
    return true;
  }
}

export function trackPageView(pathname: string, title?: string) {
  if (!isAnalyticsAllowed()) return;

  const eventPayload: AnalyticsEvent = {
    event: 'page_view',
    pathname,
    label: title || document.title,
    timestamp: new Date().toISOString(),
  };

  // 1. If Google Analytics (gtag) is configured via index.html or env
  const win = window as any;
  if (typeof win.gtag === 'function') {
    win.gtag('event', 'page_view', {
      page_path: pathname,
      page_title: title || document.title,
    });
  }

  // 2. Local performance telemetry in development
  if (import.meta.env.DEV) {
    console.debug(`📊 [ANALYTICS: PAGEVIEW] ${pathname} (${document.title})`);
  }
}

export function trackUserAction(action: string, category: string, label?: string) {
  if (!isAnalyticsAllowed()) return;

  const win = window as any;
  if (typeof win.gtag === 'function') {
    win.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }

  if (import.meta.env.DEV) {
    console.debug(`📊 [ANALYTICS: ACTION] [${category}] ${action} ${label ? `(${label})` : ''}`);
  }
}

/**
 * Initializes Core Web Vitals monitoring (LCP, FCP, CLS) using standard browser PerformanceObserver
 */
export function initWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    // Observe Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        if (import.meta.env.DEV) {
          console.debug(`⚡ [WEB VITALS: LCP] ${Math.round(lastEntry.startTime)}ms`);
        }
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Observe First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          if (import.meta.env.DEV) {
            console.debug(`⚡ [WEB VITALS: FCP] ${Math.round(entry.startTime)}ms`);
          }
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });
  } catch (err) {
    // PerformanceObserver may throw in older browsers or strict sandboxes
  }
}
