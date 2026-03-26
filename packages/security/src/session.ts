/**
 * Session management with auto-lock and per-action re-authentication.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export enum AuthAction {
  SEND_TRANSACTION = "SEND_TRANSACTION",
  EXPORT_KEY = "EXPORT_KEY",
  SWAP = "SWAP",
  SETTINGS_CHANGE = "SETTINGS_CHANGE",
}

export interface SessionConfig {
  /** Auto-lock timeout in milliseconds. Default: 5 minutes. */
  readonly lockTimeout: number;
  /** Actions that require re-authentication while the session is unlocked. */
  readonly requireAuthFor: readonly AuthAction[];
}

export type UnlockMethod = "pin" | "biometric";

export interface SessionState {
  readonly locked: boolean;
  readonly unlockedAt: number | null;
  readonly unlockMethod: UnlockMethod | null;
  readonly lastActivity: number;
}

export type SessionEventType = "lock" | "unlock" | "activity" | "timeout";

export type SessionListener = (event: SessionEventType, state: SessionState) => void;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_CONFIG: SessionConfig = {
  lockTimeout: DEFAULT_LOCK_TIMEOUT_MS,
  requireAuthFor: [AuthAction.SEND_TRANSACTION, AuthAction.EXPORT_KEY],
};

// ---------------------------------------------------------------------------
// SessionManager
// ---------------------------------------------------------------------------

export class SessionManager {
  private readonly config: SessionConfig;
  private state: SessionState;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<SessionListener> = new Set();

  constructor(config?: Partial<SessionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      locked: true,
      unlockedAt: null,
      unlockMethod: null,
      lastActivity: Date.now(),
    };
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Start the session manager. The session begins in the locked state.
   */
  start(): void {
    this.state = {
      locked: true,
      unlockedAt: null,
      unlockMethod: null,
      lastActivity: Date.now(),
    };
  }

  /**
   * Lock the session immediately, clearing the auto-lock timer.
   */
  lock(): void {
    this.clearTimer();
    this.state = {
      ...this.state,
      locked: true,
      unlockedAt: null,
      unlockMethod: null,
    };
    this.emit("lock");
  }

  /**
   * Unlock the session using the given authentication method and start the
   * auto-lock countdown.
   */
  unlock(method: UnlockMethod): void {
    const now = Date.now();
    this.state = {
      locked: false,
      unlockedAt: now,
      unlockMethod: method,
      lastActivity: now,
    };
    this.startTimer();
    this.emit("unlock");
  }

  /**
   * Whether the session is currently locked.
   */
  isLocked(): boolean {
    return this.state.locked;
  }

  /**
   * Reset the auto-lock countdown to the full timeout duration.
   */
  resetTimer(): void {
    if (this.state.locked) return;
    this.state = { ...this.state, lastActivity: Date.now() };
    this.startTimer();
  }

  /**
   * Call on any user interaction to reset the auto-lock timer.
   */
  onActivity(): void {
    if (this.state.locked) return;
    this.state = { ...this.state, lastActivity: Date.now() };
    this.startTimer();
    this.emit("activity");
  }

  /**
   * Check whether a given action requires re-authentication.
   */
  requiresAuth(action: AuthAction): boolean {
    return (this.config.requireAuthFor as readonly AuthAction[]).includes(action);
  }

  /**
   * Return a snapshot of the current session state.
   */
  getState(): Readonly<SessionState> {
    return { ...this.state };
  }

  /**
   * Return the configured lock timeout in milliseconds.
   */
  getLockTimeout(): number {
    return this.config.lockTimeout;
  }

  /**
   * Subscribe to session events.
   */
  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Tear down timers and listeners.
   */
  destroy(): void {
    this.clearTimer();
    this.listeners.clear();
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private startTimer(): void {
    this.clearTimer();
    this.timerId = setTimeout(() => {
      this.lock();
      this.emit("timeout");
    }, this.config.lockTimeout);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private emit(event: SessionEventType): void {
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(event, snapshot);
      } catch {
        // Swallow listener errors to protect the session manager.
      }
    }
  }
}
