/**
 * React hooks for Pilot analytics.
 *
 * These are thin wrappers around a React context that exposes the
 * {@link AnalyticsTracker}.  The actual context provider should be set up
 * in the host application; these hooks simply consume it.
 *
 * NOTE: React is a peer concern — this file relies on the consumer's React
 * installation rather than bundling its own.  If React is not available at
 * runtime these hooks will throw, which is intentional (they should only
 * be imported from React components).
 */

import type { AnalyticsEvent, EventPropertyValue } from './events.js';
import type { AnalyticsTracker } from './tracker.js';

// ---------------------------------------------------------------------------
// Minimal React type stubs — avoids a hard dependency on @types/react while
// still giving us full type-safety for the hooks below.
// ---------------------------------------------------------------------------

interface ReactContext<T> {
  Provider: unknown;
  Consumer: unknown;
  displayName?: string;
  _currentValue?: T;
}

type RefObject<T> = { current: T };

/* eslint-disable @typescript-eslint/no-explicit-any */
interface React {
  createContext<T>(defaultValue: T): ReactContext<T>;
  useContext<T>(context: ReactContext<T>): T;
  useEffect(effect: () => void | (() => void), deps?: any[]): void;
  useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  useRef<T>(initialValue: T): RefObject<T>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Lazily obtain the React module at runtime. Throws with a clear message
 * if React is not available.
 */
function getReact(): React {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react') as React;
  } catch {
    throw new Error(
      '@pilot/analytics: React hooks require React to be installed as a peer dependency.',
    );
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

let _context: ReactContext<AnalyticsTracker | null> | null = null;

/** Return (and lazily create) the shared analytics React context. */
export function getAnalyticsContext(): ReactContext<AnalyticsTracker | null> {
  if (_context === null) {
    _context = getReact().createContext<AnalyticsTracker | null>(null);
  }
  return _context;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Access the full analytics API from any React component.
 *
 * ```tsx
 * const { track, identify } = useAnalytics();
 * ```
 */
export function useAnalytics(): {
  track: (event: AnalyticsEvent, properties?: Record<string, EventPropertyValue>) => void;
  identify: (anonymousId: string) => void;
} {
  const React = getReact();
  const tracker = React.useContext(getAnalyticsContext());

  const track = React.useCallback(
    (event: AnalyticsEvent, properties?: Record<string, EventPropertyValue>) => {
      tracker?.track(event, properties);
    },
    [tracker],
  );

  const identify = React.useCallback(
    (anonymousId: string) => {
      tracker?.identify(anonymousId);
    },
    [tracker],
  );

  return { track, identify };
}

/**
 * Track a page view whenever `pageName` changes.
 *
 * ```tsx
 * useTrackPageView('settings');
 * ```
 */
export function useTrackPageView(pageName: string): void {
  const React = getReact();
  const { track } = useAnalytics();

  const pageRef = React.useRef(pageName);
  pageRef.current = pageName;

  React.useEffect(() => {
    track('page_view' as unknown as AnalyticsEvent, { page: pageRef.current });
  }, [pageName, track]);
}

/**
 * Convenience hook that returns just the `track` function.
 *
 * ```tsx
 * const track = useTrackEvent();
 * track(AnalyticsEvent.SWAP_INITIATED, { pair: 'XRP/USD' });
 * ```
 */
export function useTrackEvent(): (
  event: AnalyticsEvent,
  properties?: Record<string, EventPropertyValue>,
) => void {
  const { track } = useAnalytics();
  return track;
}
