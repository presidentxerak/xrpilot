/**
 * Anti-phishing protections: domain validation, scam detection, and
 * human-readable transaction previews for signing requests.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export enum DomainTrust {
  /** Domain is on the verified allowlist */
  VERIFIED = "VERIFIED",
  /** Domain is not recognized but not flagged */
  UNKNOWN = "UNKNOWN",
  /** Domain is structurally suspicious (typosquatting, etc.) */
  SUSPICIOUS = "SUSPICIOUS",
  /** Domain is on the known-scam blocklist */
  BLOCKED = "BLOCKED",
}

export interface DomainWarning {
  readonly trust: DomainTrust;
  readonly message: string;
}

export interface TransactionPreview {
  readonly type: string;
  readonly summary: string;
  readonly fields: readonly TransactionField[];
  readonly warnings: readonly string[];
}

export interface TransactionField {
  readonly label: string;
  readonly value: string;
  readonly sensitive: boolean;
}

// ---------------------------------------------------------------------------
// Known domain lists
// ---------------------------------------------------------------------------

/**
 * Verified XRPL ecosystem domains. In production this would be fetched
 * from a signed, periodically updated registry.
 */
const VERIFIED_DOMAINS: ReadonlySet<string> = new Set([
  "xrpl.org",
  "ripple.com",
  "xrpscan.com",
  "bithomp.com",
  "xrplorer.com",
  "sologenic.com",
  "gatehub.net",
  "xumm.app",
  "xaman.app",
  "first-ledger.com",
]);

/**
 * Known scam / phishing domains. In production this would be a
 * continuously updated feed.
 */
const BLOCKED_DOMAINS: ReadonlySet<string> = new Set([
  "xrp-airdrop.com",
  "ripple-giveaway.com",
  "xrpl-claim.com",
  "xrp-bonus.net",
  "ripple-rewards.io",
  "free-xrp.org",
  "xrp-drop.com",
]);

/**
 * Patterns commonly used in phishing / typosquatting attacks against
 * XRPL sites.
 */
const SUSPICIOUS_PATTERNS: readonly RegExp[] = [
  /xrp.*(?:claim|free|bonus|reward|airdrop|give)/i,
  /ripple.*(?:claim|free|bonus|reward|airdrop|give)/i,
  /(?:claim|free|bonus|reward|airdrop|give).*xrp/i,
  /r[i1]pp[l1]e/i, // "ripple" with l33t substitutions (but not "ripple" itself)
  /xr[p9]l/i, // "xrpl" with digit substitutions
];

// ---------------------------------------------------------------------------
// Domain validation
// ---------------------------------------------------------------------------

/**
 * Evaluate the trust level of a domain.
 */
export function validateDomain(domain: string): DomainTrust {
  const normalized = normalizeDomain(domain);

  if (BLOCKED_DOMAINS.has(normalized)) {
    return DomainTrust.BLOCKED;
  }

  if (VERIFIED_DOMAINS.has(normalized)) {
    return DomainTrust.VERIFIED;
  }

  if (isSuspicious(normalized)) {
    return DomainTrust.SUSPICIOUS;
  }

  return DomainTrust.UNKNOWN;
}

/**
 * Return a human-readable warning for a domain.
 */
export function getDomainWarning(domain: string): DomainWarning {
  const trust = validateDomain(domain);

  switch (trust) {
    case DomainTrust.VERIFIED:
      return { trust, message: `${domain} is a verified XRPL ecosystem domain.` };
    case DomainTrust.BLOCKED:
      return {
        trust,
        message: `WARNING: ${domain} is a known phishing/scam domain. Do not interact.`,
      };
    case DomainTrust.SUSPICIOUS:
      return {
        trust,
        message: `CAUTION: ${domain} looks suspicious and may be a phishing attempt.`,
      };
    case DomainTrust.UNKNOWN:
      return {
        trust,
        message: `${domain} is not recognized. Proceed with caution.`,
      };
  }
}

/**
 * Check whether a domain is on the known scam blocklist.
 */
export function isKnownScamDomain(domain: string): boolean {
  return BLOCKED_DOMAINS.has(normalizeDomain(domain));
}

// ---------------------------------------------------------------------------
// Transaction preview
// ---------------------------------------------------------------------------

/**
 * Format a raw XRPL transaction into a human-readable preview suitable
 * for displaying to the user before signing.
 */
export function formatTransactionPreview(tx: unknown): TransactionPreview {
  if (!isRecord(tx)) {
    return {
      type: "Unknown",
      summary: "Unable to parse transaction",
      fields: [],
      warnings: ["Transaction format is not recognized. Do not sign unless you trust the source."],
    };
  }

  const txType = typeof tx["TransactionType"] === "string" ? tx["TransactionType"] : "Unknown";
  const fields: TransactionField[] = [];
  const warnings: string[] = [];

  // Common fields
  if (typeof tx["Account"] === "string") {
    fields.push({ label: "From", value: tx["Account"], sensitive: false });
  }
  if (typeof tx["Destination"] === "string") {
    fields.push({ label: "To", value: tx["Destination"], sensitive: false });
  }
  if (typeof tx["Fee"] === "string") {
    const feeXrp = dropsToXrp(tx["Fee"]);
    fields.push({ label: "Fee", value: `${feeXrp} XRP`, sensitive: false });

    // Warn about abnormally high fees
    if (parseInt(tx["Fee"], 10) > 1_000_000) {
      warnings.push(`Unusually high fee: ${feeXrp} XRP. This may drain your account.`);
    }
  }

  // Payment-specific
  if (txType === "Payment") {
    const amount = tx["Amount"];
    if (typeof amount === "string") {
      const xrp = dropsToXrp(amount);
      fields.push({ label: "Amount", value: `${xrp} XRP`, sensitive: false });
    } else if (isRecord(amount)) {
      const tokenAmount = `${amount["value"]} ${amount["currency"]}`;
      fields.push({ label: "Amount", value: tokenAmount, sensitive: false });
      if (typeof amount["issuer"] === "string") {
        fields.push({ label: "Issuer", value: amount["issuer"] as string, sensitive: false });
      }
    }

    if (typeof tx["DestinationTag"] === "number") {
      fields.push({
        label: "Destination Tag",
        value: String(tx["DestinationTag"]),
        sensitive: false,
      });
    }
  }

  // TrustSet -- warn about unlimited trust lines
  if (txType === "TrustSet" && isRecord(tx["LimitAmount"])) {
    const limit = tx["LimitAmount"];
    fields.push({
      label: "Trust Currency",
      value: `${limit["currency"]}`,
      sensitive: false,
    });
    fields.push({
      label: "Trust Limit",
      value: `${limit["value"]}`,
      sensitive: false,
    });
    if (typeof limit["issuer"] === "string") {
      fields.push({ label: "Issuer", value: limit["issuer"] as string, sensitive: false });
    }

    const limitValue = parseFloat(String(limit["value"]));
    if (limitValue > 1_000_000_000) {
      warnings.push("Very high trust limit. Ensure you trust this issuer.");
    }
  }

  // SetRegularKey -- extremely sensitive
  if (txType === "SetRegularKey") {
    if (typeof tx["RegularKey"] === "string") {
      fields.push({ label: "New Regular Key", value: tx["RegularKey"], sensitive: true });
    }
    warnings.push("This grants another key full access to your account. Proceed with extreme caution.");
  }

  // AccountDelete
  if (txType === "AccountDelete") {
    warnings.push("This will permanently delete your XRPL account.");
  }

  // SignerListSet
  if (txType === "SignerListSet") {
    warnings.push("This modifies the multi-signing configuration of your account.");
  }

  const summary = buildSummary(txType, fields);

  return { type: txType, summary, fields, warnings };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "").replace(/\/+$/, "");
}

function isSuspicious(domain: string): boolean {
  // Skip if the domain is in the verified list to avoid false positives on
  // patterns like "xrpl".
  if (VERIFIED_DOMAINS.has(domain)) return false;
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(domain));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dropsToXrp(drops: string): string {
  const num = parseInt(drops, 10);
  if (Number.isNaN(num)) return drops;
  return (num / 1_000_000).toFixed(6);
}

function buildSummary(txType: string, fields: TransactionField[]): string {
  const to = fields.find((f) => f.label === "To")?.value;
  const amount = fields.find((f) => f.label === "Amount")?.value;

  switch (txType) {
    case "Payment":
      return amount && to
        ? `Send ${amount} to ${truncateAddress(to)}`
        : "Payment transaction";
    case "TrustSet": {
      const currency = fields.find((f) => f.label === "Trust Currency")?.value;
      return currency ? `Set trust line for ${currency}` : "Set trust line";
    }
    case "OfferCreate":
      return "Create DEX offer";
    case "OfferCancel":
      return "Cancel DEX offer";
    case "SetRegularKey":
      return "Set regular key (grants account access)";
    case "AccountDelete":
      return "Delete account permanently";
    case "SignerListSet":
      return "Modify multi-sign configuration";
    default:
      return `${txType} transaction`;
  }
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
