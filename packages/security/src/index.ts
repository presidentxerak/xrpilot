export {
  PinManager,
  hashPin,
  PinLockedError,
  PinNotSetupError,
  PinIncorrectError,
  PinTooShortError,
  PinInvalidFormatError,
  type PinHash,
  type LockoutState,
  type PinStore,
} from "./pin.js";

export {
  BiometricAuth,
  BiometricsUnavailableError,
  BiometricEnrollmentFailedError,
  type BiometricStore,
  type BiometricResult,
} from "./biometrics.js";

export {
  SessionManager,
  AuthAction,
  type SessionConfig,
  type UnlockMethod,
  type SessionState,
  type SessionEventType,
  type SessionListener,
} from "./session.js";

export {
  SecureStorage,
  SecureStorageDecryptError,
  SecureStorageCorruptError,
  type StorageBackend,
} from "./secure-storage.js";

export {
  validateDomain,
  getDomainWarning,
  isKnownScamDomain,
  formatTransactionPreview,
  DomainTrust,
  type DomainWarning,
  type TransactionPreview,
  type TransactionField,
} from "./anti-phishing.js";

export {
  AuditLog,
  SecurityAction,
  type SecurityEvent,
  type AuditFilter,
  type AuditStore,
} from "./audit.js";
