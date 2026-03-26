/**
 * Analytics event definitions for Pilot.
 *
 * PRIVACY POLICY — the following MUST NEVER be included in any event payload:
 *   - Private keys or seeds
 *   - Full wallet addresses (use anonymizeAddress from privacy.ts)
 *   - PIN codes or passwords
 *   - Personal data (name, email, phone, etc.)
 */

export enum AnalyticsEvent {
  // Wallet lifecycle
  WALLET_CREATED = 'wallet_created',
  WALLET_IMPORTED = 'wallet_imported',
  WALLET_ACTIVATED = 'wallet_activated',

  // First-time milestones
  FIRST_OBJECT_RECEIVED = 'first_object_received',
  FIRST_TRANSACTION_SENT = 'first_transaction_sent',
  FIRST_TRANSACTION_RECEIVED = 'first_transaction_received',

  // DeFi actions
  SWAP_INITIATED = 'swap_initiated',
  SWAP_COMPLETED = 'swap_completed',
  TRUST_LINE_ADDED = 'trust_line_added',

  // Digital objects
  OBJECT_VIEWED = 'object_viewed',
  OBJECT_SHARED = 'object_shared',
  OBJECT_TRANSFERRED = 'object_transferred',

  // App-level
  APP_OPENED = 'app_opened',
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ADVANCED_MODE_ENABLED = 'advanced_mode_enabled',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
}

/** Safe property value types — only primitives, no objects or arrays. */
export type EventPropertyValue = string | number | boolean;

/** Payload sent with every tracked event. */
export interface EventPayload {
  event: AnalyticsEvent;
  timestamp: number;
  properties: Record<string, EventPropertyValue>;
  sessionId: string;
}
