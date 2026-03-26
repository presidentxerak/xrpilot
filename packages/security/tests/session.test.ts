import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager, AuthAction } from '../src/session';

describe('SessionManager', () => {
  let session: SessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    session = new SessionManager({
      lockTimeout: 5000,
      requireAuthFor: [AuthAction.SEND_TRANSACTION, AuthAction.EXPORT_KEY],
    });
  });

  afterEach(() => {
    session.destroy();
    vi.useRealTimers();
  });

  it('starts in locked state', () => {
    session.start();
    expect(session.isLocked()).toBe(true);
  });

  it('unlocks with PIN', () => {
    session.start();
    session.unlock('pin');
    expect(session.isLocked()).toBe(false);
    expect(session.getState().unlockMethod).toBe('pin');
  });

  it('locks manually', () => {
    session.unlock('pin');
    session.lock();
    expect(session.isLocked()).toBe(true);
  });

  it('auto-locks after timeout', () => {
    session.unlock('pin');
    expect(session.isLocked()).toBe(false);
    vi.advanceTimersByTime(5001);
    expect(session.isLocked()).toBe(true);
  });

  it('resets timer on activity', () => {
    session.unlock('pin');
    vi.advanceTimersByTime(4000);
    session.onActivity();
    vi.advanceTimersByTime(4000);
    expect(session.isLocked()).toBe(false);
    vi.advanceTimersByTime(2000);
    expect(session.isLocked()).toBe(true);
  });

  it('requires auth for configured actions', () => {
    expect(session.requiresAuth(AuthAction.SEND_TRANSACTION)).toBe(true);
    expect(session.requiresAuth(AuthAction.EXPORT_KEY)).toBe(true);
    expect(session.requiresAuth(AuthAction.SETTINGS_CHANGE)).toBe(false);
  });

  it('emits events on lock/unlock', () => {
    const events: string[] = [];
    session.subscribe((event) => events.push(event));
    session.unlock('biometric');
    session.lock();
    expect(events).toEqual(['unlock', 'lock']);
  });

  it('emits timeout event on auto-lock', () => {
    const events: string[] = [];
    session.subscribe((event) => events.push(event));
    session.unlock('pin');
    vi.advanceTimersByTime(5001);
    expect(events).toContain('lock');
    expect(events).toContain('timeout');
  });
});
