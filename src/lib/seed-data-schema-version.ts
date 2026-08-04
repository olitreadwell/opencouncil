/**
 * Schema version marker for the generated `prisma/seed_data.json` dump.
 *
 * Bump this whenever a change to the Prisma schema (or to
 * `scripts/generate_seed_dump.ts` itself) changes the shape of the dumped
 * data — e.g. a field is added, renamed, or removed. `prisma/seed.ts`
 * compares a cached dump's `metadata.schema_version` against this constant
 * and refuses to use a stale cache, so contributors don't hit confusing
 * "Unknown argument" errors from Prisma when their local dump predates a
 * schema change.
 */
export const SEED_DATA_SCHEMA_VERSION = '1.0';

/**
 * A cached seed dump is stale if it was generated for a different schema
 * version, or is missing a version marker entirely (dumps generated before
 * this check existed have no `metadata.schema_version` at all).
 */
export function isSeedDataStale(data: { metadata?: { schema_version?: string } } | null | undefined): boolean {
    return data?.metadata?.schema_version !== SEED_DATA_SCHEMA_VERSION;
}
