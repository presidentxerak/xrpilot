export interface Token {
  /** Currency code — 3-char ISO code or 40-char hex for non-standard */
  readonly currency: string;
  /** Issuer address (empty string for XRP) */
  readonly issuer: string;
  /** Current balance as a decimal string */
  readonly balance: string;
  /** Human-readable display name (e.g. "USD Coin") */
  readonly name: string;
  /** Whether this token has been verified by a known authority */
  readonly verified: boolean;
}

export interface TrustLine {
  /** Currency code */
  readonly currency: string;
  /** Issuer address */
  readonly issuer: string;
  /** Maximum amount the account trusts the issuer for */
  readonly limit: string;
  /** Current balance on the trust line */
  readonly balance: string;
  /** Whether the peer has authorized this trust line */
  readonly peerAuthorized: boolean;
  /** Whether the line is frozen by the issuer */
  readonly frozen: boolean;
  /** Whether rippling is disabled on this line */
  readonly noRipple: boolean;
}
