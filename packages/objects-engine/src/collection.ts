/**
 * Collection management -- fetching, filtering, grouping and searching
 * Digital Objects for a Pilot account.
 */

import type { ObjectCategory } from "@pilot/shared";
import type {
  DigitalObject,
  ObjectCollection,
  ObjectFilter,
  XrplNFT,
} from "./types.js";
import { parseNFToken } from "./parser.js";

// ---------------------------------------------------------------------------
// ObjectManager
// ---------------------------------------------------------------------------

/**
 * High-level manager for a user's Digital Object collection.
 *
 * Wraps the lower-level parser and provides filtering, grouping and
 * full-text search over the user's objects.
 */
export class ObjectManager {
  /**
   * Fetch and parse all Digital Objects for the given XRPL account.
   *
   * @param address - XRPL account address
   * @param filter  - Optional filter to narrow results
   * @param fetchAccountNFTs - Callback that returns the raw NFTokens for an
   *   account.  This keeps the engine transport-agnostic -- callers provide
   *   their own XRPL client integration.
   */
  async getObjects(
    address: string,
    filter: ObjectFilter | undefined,
    fetchAccountNFTs: (address: string) => Promise<readonly XrplNFT[]>,
  ): Promise<DigitalObject[]> {
    const raw = await fetchAccountNFTs(address);
    const objects = await Promise.all(raw.map((nft) => parseNFToken(nft)));
    return applyFilter(objects, filter);
  }

  /**
   * Retrieve a single Digital Object by its token ID.
   *
   * @param objectId - The NFToken ID
   * @param fetchNFT - Callback returning the raw NFToken
   */
  async getObject(
    objectId: string,
    fetchNFT: (id: string) => Promise<XrplNFT>,
  ): Promise<DigitalObject> {
    const nft = await fetchNFT(objectId);
    return parseNFToken(nft);
  }

  /**
   * Group objects by their category.
   */
  groupByCategory(
    objects: readonly DigitalObject[],
  ): Record<ObjectCategory, DigitalObject[]> {
    const groups: Record<ObjectCategory, DigitalObject[]> = {
      ticket: [],
      coupon: [],
      collectible: [],
      pass: [],
      nft: [],
    };

    for (const obj of objects) {
      groups[obj.category].push(obj);
    }
    return groups;
  }

  /**
   * Group objects by issuer / collection.
   *
   * Objects that do not declare a collection are grouped under their
   * issuer address.
   */
  groupByCollection(
    objects: readonly DigitalObject[],
  ): ObjectCollection[] {
    const map = new Map<
      string,
      { name: string; issuer: DigitalObject["issuer"]; items: DigitalObject[] }
    >();

    for (const obj of objects) {
      const key = obj.collection ?? obj.issuer.address;
      const existing = map.get(key);
      if (existing) {
        existing.items.push(obj);
      } else {
        map.set(key, {
          name: obj.collection ?? obj.issuer.name || obj.issuer.address,
          issuer: obj.issuer,
          items: [obj],
        });
      }
    }

    const collections: ObjectCollection[] = [];
    for (const [id, entry] of map) {
      collections.push({
        id,
        name: entry.name,
        objects: entry.items,
        issuer: entry.issuer,
      });
    }
    return collections;
  }

  /**
   * Full-text search across object name, description and issuer name.
   */
  search(objects: readonly DigitalObject[], query: string): DigitalObject[] {
    const q = query.toLowerCase().trim();
    if (!q) return [...objects];

    return objects.filter((obj) => {
      const haystack = [
        obj.name,
        obj.description,
        obj.issuer.name,
        obj.utility,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applyFilter(
  objects: DigitalObject[],
  filter?: ObjectFilter,
): DigitalObject[] {
  if (!filter) return objects;

  let result = objects;

  if (filter.category) {
    result = result.filter((o) => o.category === filter.category);
  }
  if (filter.issuer) {
    result = result.filter((o) => o.issuer.address === filter.issuer);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter((o) => {
      const haystack = [o.name, o.description, o.issuer.name, o.utility]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return result;
}
