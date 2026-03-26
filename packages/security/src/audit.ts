/**
 * Security audit logging. Records security-relevant events for review
 * and forensic analysis.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export enum SecurityAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  SEND = "SEND",
  EXPORT_KEY = "EXPORT_KEY",
  FAILED_PIN = "FAILED_PIN",
  LOCKOUT = "LOCKOUT",
  DOMAIN_APPROVAL = "DOMAIN_APPROVAL",
}

export interface SecurityEvent {
  readonly action: SecurityAction;
  readonly timestamp: number;
  readonly success: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface AuditFilter {
  readonly action?: SecurityAction;
  readonly success?: boolean;
  readonly since?: number;
  readonly until?: number;
  readonly limit?: number;
}

export interface AuditStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORE_KEY = "audit:log";
const MAX_EVENTS = 1000;

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------

export class AuditLog {
  private readonly store: AuditStore;
  private events: SecurityEvent[] = [];
  private loaded = false;

  constructor(store: AuditStore) {
    this.store = store;
  }

  /**
   * Record a security event.
   */
  async log(event: SecurityEvent): Promise<void> {
    await this.ensureLoaded();

    this.events.push({
      action: event.action,
      timestamp: event.timestamp,
      success: event.success,
      metadata: event.metadata ? { ...event.metadata } : undefined,
    });

    // Cap the log to prevent unbounded growth.
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(this.events.length - MAX_EVENTS);
    }

    await this.persist();
  }

  /**
   * Convenience method: log an event with the current timestamp.
   */
  async logNow(
    action: SecurityAction,
    success: boolean,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.log({
      action,
      timestamp: Date.now(),
      success,
      metadata,
    });
  }

  /**
   * Retrieve events matching the given filters.
   */
  async getLog(filters?: AuditFilter): Promise<readonly SecurityEvent[]> {
    await this.ensureLoaded();

    let result: SecurityEvent[] = [...this.events];

    if (filters) {
      if (filters.action !== undefined) {
        result = result.filter((e) => e.action === filters.action);
      }
      if (filters.success !== undefined) {
        result = result.filter((e) => e.success === filters.success);
      }
      if (filters.since !== undefined) {
        const since = filters.since;
        result = result.filter((e) => e.timestamp >= since);
      }
      if (filters.until !== undefined) {
        const until = filters.until;
        result = result.filter((e) => e.timestamp <= until);
      }
      if (filters.limit !== undefined) {
        result = result.slice(-filters.limit);
      }
    }

    return result;
  }

  /**
   * Return the total number of recorded events.
   */
  async count(): Promise<number> {
    await this.ensureLoaded();
    return this.events.length;
  }

  /**
   * Clear all recorded events.
   */
  async clear(): Promise<void> {
    this.events = [];
    await this.persist();
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    const raw = await this.store.get(STORE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.events = parsed as SecurityEvent[];
        }
      } catch {
        // Corrupted log; start fresh.
        this.events = [];
      }
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await this.store.set(STORE_KEY, JSON.stringify(this.events));
  }
}
