/**
 * Core analytics tracker for Pilot.
 *
 * Privacy-first design:
 *   - All addresses are hashed before they leave the device
 *   - PII is stripped from every event payload
 *   - Do Not Track / GPC / explicit consent are checked before sending
 *   - No data is sent when tracking is disabled
 */

import { AnalyticsEvent, type EventPayload, type EventPropertyValue } from './events.js';
import { anonymizeAddress, isTrackingAllowed, sanitizeProperties } from './privacy.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrackerConfig {
  /** Remote endpoint that receives batched event payloads. */
  endpoint?: string;
  /** Master switch — when false, nothing is tracked or sent. */
  enabled: boolean;
  /** Log queued / flushed events to the console. */
  debug?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum events held in the queue before an automatic flush. */
const BATCH_SIZE = 10;

/** Interval (ms) between automatic flushes. */
const FLUSH_INTERVAL_MS = 30_000;

/** Pattern that matches XRPL classic addresses in property values. */
const XRPL_ADDRESS_RE = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

// ---------------------------------------------------------------------------
// Tracker
// ---------------------------------------------------------------------------

export class AnalyticsTracker {
  private readonly config: TrackerConfig;
  private queue: EventPayload[] = [];
  private anonymousId: string | null = null;
  private sessionId: string;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: TrackerConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();

    if (config.enabled) {
      this.startAutoFlush();
    }
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Queue an analytics event.  The event is sanitized and enriched before
   * being added to the internal queue.  A flush is triggered automatically
   * when the queue reaches {@link BATCH_SIZE}.
   */
  track(
    event: AnalyticsEvent,
    properties?: Record<string, EventPropertyValue>,
  ): void {
    if (!this.config.enabled) return;
    if (!isTrackingAllowed()) return;

    const sanitized = this.prepareProperties(properties ?? {});

    const payload: EventPayload = {
      event,
      timestamp: Date.now(),
      properties: {
        ...sanitized,
        ...(this.anonymousId ? { anonymous_id: this.anonymousId } : {}),
      },
      sessionId: this.sessionId,
    };

    this.queue.push(payload);

    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.debug('[pilot/analytics] queued', payload);
    }

    if (this.queue.length >= BATCH_SIZE) {
      void this.flush();
    }
  }

  /**
   * Associate all future events with an anonymous identifier.
   * This MUST be an opaque, non-reversible ID — never a wallet address
   * or personal identifier.
   */
  identify(anonymousId: string): void {
    this.anonymousId = anonymousId;
  }

  /**
   * Send all queued events to the configured endpoint.
   *
   * The queue is drained before the network call so that concurrent
   * `track()` calls are not lost if the request fails.
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    if (!this.config.endpoint) {
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.debug('[pilot/analytics] no endpoint configured — dropping batch');
      }
      this.queue = [];
      return;
    }

    const batch = [...this.queue];
    this.queue = [];

    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.debug(`[pilot/analytics] flushing ${batch.length} event(s)`);
    }

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // Re-queue on failure so events are not silently lost.
      this.queue = [...batch, ...this.queue];
    }
  }

  /** Stop the automatic flush timer and drain remaining events. */
  async destroy(): Promise<void> {
    this.stopAutoFlush();
    await this.flush();
  }

  /** Return the current number of queued (unsent) events. */
  get queueSize(): number {
    return this.queue.length;
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  /**
   * Sanitize and anonymize event properties.
   *
   * 1. Strip any PII-flagged keys / values via {@link sanitizeProperties}.
   * 2. Hash any remaining string values that look like XRPL addresses.
   */
  private prepareProperties(
    raw: Record<string, EventPropertyValue>,
  ): Record<string, EventPropertyValue> {
    const sanitized = sanitizeProperties(raw);
    const result: Record<string, EventPropertyValue> = {};

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && XRPL_ADDRESS_RE.test(value)) {
        result[key] = anonymizeAddress(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private startAutoFlush(): void {
    if (this.flushTimer !== null) return;
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  private stopAutoFlush(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private generateSessionId(): string {
    // Simple collision-resistant random hex string (no crypto dependency)
    const parts: string[] = [];
    for (let i = 0; i < 4; i++) {
      parts.push(Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0'));
    }
    return parts.join('');
  }
}
