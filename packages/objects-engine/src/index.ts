/**
 * @pilot/objects-engine
 *
 * Core Digital Objects system for Pilot -- a digital object wallet on XRPL.
 */

// Types
export type {
  DigitalObject,
  ObjectCollection,
  ObjectInteraction,
  ObjectFilter,
  ObjectExchangeListing,
  ObjectIssuer,
  XrplNFT,
  NFTMetadata,
  PreparedTransaction,
  TransferRecord,
} from "./types.js";
export type { ObjectCategory } from "@pilot/shared";

// Parser
export {
  parseNFToken,
  parseMetadata,
  detectCategory,
  getObjectImage,
  resolveIpfsUri,
} from "./parser.js";

// Collection management
export { ObjectManager } from "./collection.js";

// Transfer operations
export {
  prepareTransfer,
  prepareAcceptTransfer,
  getTransferHistory,
  toHumanReadable,
  toHumanReadableFromObject,
} from "./transfer.js";
export type { TransferParams } from "./transfer.js";

// Exchange (Advanced Mode)
export {
  advancedOnly,
  createListing,
  cancelListing,
  purchaseObject,
  getListings,
  estimateFees,
} from "./exchange.js";
export type { CreateListingParams, FeeEstimate } from "./exchange.js";

// Display utilities
export {
  getCategoryLabel,
  getCategoryIcon,
  getObjectDisplayName,
  getObjectDescription,
  getIssuerDisplay,
  formatObjectForShare,
} from "./display.js";
