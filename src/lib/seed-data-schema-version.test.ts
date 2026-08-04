import { SEED_DATA_SCHEMA_VERSION, isSeedDataStale } from './seed-data-schema-version';

describe('isSeedDataStale', () => {
    it('is not stale when schema_version matches the current version', () => {
        expect(isSeedDataStale({ metadata: { schema_version: SEED_DATA_SCHEMA_VERSION } })).toBe(false);
    });

    it('is stale when schema_version does not match the current version', () => {
        expect(isSeedDataStale({ metadata: { schema_version: '0.9' } })).toBe(true);
    });

    it('is stale when metadata has no schema_version (older dumps predate this check)', () => {
        expect(isSeedDataStale({ metadata: {} })).toBe(true);
    });

    it('is stale when metadata is missing entirely', () => {
        expect(isSeedDataStale({})).toBe(true);
    });

    it('is stale when the dump itself is missing', () => {
        expect(isSeedDataStale(null)).toBe(true);
        expect(isSeedDataStale(undefined)).toBe(true);
    });
});
