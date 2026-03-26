import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsTracker } from '../src/tracker.js';
import { AnalyticsEvent } from '../src/events.js';
import * as privacy from '../src/privacy.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a tracker with sensible test defaults. */
function createTracker(overrides: Partial<Parameters<typeof AnalyticsTracker['prototype']['track']>[1]> & {
  enabled?: boolean;
  endpoint?: string;
  debug?: boolean;
} = {}) {
  return new AnalyticsTracker({
    enabled: overrides.enabled ?? true,
    endpoint: overrides.endpoint ?? 'https://analytics.test/v1/events',
    debug: overrides.debug ?? false,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AnalyticsTracker', () => {
  beforeEach(() => {
    // Allow tracking by default in tests
    vi.spyOn(privacy, 'isTrackingAllowed').mockReturnValue(true);
    // Stub fetch globally
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // -----------------------------------------------------------------------
  // Event queuing
  // -----------------------------------------------------------------------

  describe('event queuing', () => {
    it('should queue events when tracking is enabled', () => {
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.APP_OPENED);
      expect(tracker.queueSize).toBe(1);
    });

    it('should not queue events when tracking is disabled', () => {
      const tracker = createTracker({ enabled: false });
      tracker.track(AnalyticsEvent.APP_OPENED);
      expect(tracker.queueSize).toBe(0);
    });

    it('should not queue events when isTrackingAllowed returns false', () => {
      vi.spyOn(privacy, 'isTrackingAllowed').mockReturnValue(false);
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.APP_OPENED);
      expect(tracker.queueSize).toBe(0);
    });

    it('should include properties and sessionId in queued events', () => {
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.SWAP_INITIATED, { pair: 'XRP/USD' });
      // Flush to inspect the payload sent via fetch
      void tracker.flush();
      const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(call[1].body as string);
      const event = body.events[0];
      expect(event.event).toBe(AnalyticsEvent.SWAP_INITIATED);
      expect(event.properties.pair).toBe('XRP/USD');
      expect(event.sessionId).toBeDefined();
    });

    it('should attach anonymous_id after identify()', () => {
      const tracker = createTracker();
      tracker.identify('user-abc-123');
      tracker.track(AnalyticsEvent.WALLET_CREATED);
      void tracker.flush();
      const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(call[1].body as string);
      expect(body.events[0].properties.anonymous_id).toBe('user-abc-123');
    });
  });

  // -----------------------------------------------------------------------
  // Batching
  // -----------------------------------------------------------------------

  describe('batching', () => {
    it('should auto-flush when queue reaches batch size (10)', () => {
      const tracker = createTracker();
      for (let i = 0; i < 10; i++) {
        tracker.track(AnalyticsEvent.OBJECT_VIEWED, { index: i });
      }
      // fetch should have been called once for the auto-flush
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(tracker.queueSize).toBe(0);
    });

    it('should not auto-flush below batch size', () => {
      const tracker = createTracker();
      for (let i = 0; i < 9; i++) {
        tracker.track(AnalyticsEvent.OBJECT_VIEWED, { index: i });
      }
      expect(fetch).not.toHaveBeenCalled();
      expect(tracker.queueSize).toBe(9);
    });

    it('should flush on timer interval', async () => {
      vi.useFakeTimers();
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.APP_OPENED);
      expect(fetch).not.toHaveBeenCalled();

      // Advance past the 30-second interval
      vi.advanceTimersByTime(30_000);

      // The timer-triggered flush is async — let microtasks resolve
      await vi.runAllTimersAsync();

      expect(fetch).toHaveBeenCalledTimes(1);
      vi.useRealTimers();

      // Clean up
      await tracker.destroy();
    });
  });

  // -----------------------------------------------------------------------
  // Flushing
  // -----------------------------------------------------------------------

  describe('flush', () => {
    it('should drain the queue on flush', async () => {
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.WALLET_CREATED);
      tracker.track(AnalyticsEvent.WALLET_ACTIVATED);
      expect(tracker.queueSize).toBe(2);
      await tracker.flush();
      expect(tracker.queueSize).toBe(0);
    });

    it('should re-queue events when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.APP_OPENED);
      await tracker.flush();
      // Events should be back in the queue
      expect(tracker.queueSize).toBe(1);
    });

    it('should drop events when no endpoint is configured', async () => {
      const tracker = createTracker({ endpoint: undefined });
      tracker.track(AnalyticsEvent.APP_OPENED);
      await tracker.flush();
      expect(tracker.queueSize).toBe(0);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Privacy / sanitization
  // -----------------------------------------------------------------------

  describe('privacy sanitization', () => {
    it('should hash XRPL addresses in properties', async () => {
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.OBJECT_TRANSFERRED, {
        recipient: 'rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG',
      });
      await tracker.flush();
      const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(call[1].body as string);
      const props = body.events[0].properties;
      // Should be hashed, not the raw address
      expect(props.recipient).toMatch(/^anon_[0-9a-f]{8}$/);
      expect(props.recipient).not.toBe('rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG');
    });

    it('should strip PII-flagged keys', async () => {
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.ERROR_OCCURRED, {
        error_code: 'timeout',
        email: 'user@example.com',
        secret: 'supersecret',
      });
      await tracker.flush();
      const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(call[1].body as string);
      const props = body.events[0].properties;
      expect(props.error_code).toBe('timeout');
      expect(props.email).toBeUndefined();
      expect(props.secret).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // destroy
  // -----------------------------------------------------------------------

  describe('destroy', () => {
    it('should flush remaining events and stop timer', async () => {
      const tracker = createTracker();
      tracker.track(AnalyticsEvent.APP_OPENED);
      await tracker.destroy();
      expect(tracker.queueSize).toBe(0);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
