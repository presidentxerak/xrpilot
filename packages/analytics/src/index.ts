export {
  AnalyticsEvent,
  type EventPayload,
  type EventPropertyValue,
} from './events.js';

export {
  AnalyticsTracker,
  type TrackerConfig,
} from './tracker.js';

export {
  anonymizeAddress,
  sanitizeProperties,
  isTrackingAllowed,
  grantConsent,
  revokeConsent,
  hasConsentDecision,
  getConsentStatus,
} from './privacy.js';

export {
  getAnalyticsContext,
  useAnalytics,
  useTrackPageView,
  useTrackEvent,
} from './hooks.js';
