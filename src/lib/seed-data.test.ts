import { SEED_DATA_SCHEMA_VERSION } from './seed-data-schema-version';

// Mock env.mjs (ESM module that jest can't import directly)
jest.mock('@/env.mjs', () => ({
    env: { SEED_DATA_PATH: 'prisma/seed_data.json' }
}));

jest.mock('fs');

import type * as fsType from 'fs';
import type { loadSeedData as loadSeedDataType } from './seed-data';

describe('loadSeedData', () => {
    let mockedFs: jest.Mocked<typeof fsType>;
    let loadSeedData: typeof loadSeedDataType;

    // The module caches seed data in a module-level variable, so each test
    // needs a fresh module instance to avoid bleeding state between cases.
    beforeEach(() => {
        jest.resetModules();
        mockedFs = require('fs');
        ({ loadSeedData } = require('./seed-data'));
    });

    it('loads and returns seed data when schema_version matches the current version', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readFileSync.mockReturnValue(
            JSON.stringify({ metadata: { schema_version: SEED_DATA_SCHEMA_VERSION }, cities: [] })
        );

        const data = loadSeedData();

        expect(data).toEqual({ metadata: { schema_version: SEED_DATA_SCHEMA_VERSION }, cities: [] });
    });

    it('throws when the cached file schema_version does not match the current version', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readFileSync.mockReturnValue(
            JSON.stringify({ metadata: { schema_version: '0.9' }, cities: [] })
        );

        expect(() => loadSeedData()).toThrow('Failed to load seed data');
    });

    it('throws when the cached file has no schema_version (dump predates this check)', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readFileSync.mockReturnValue(JSON.stringify({ metadata: {}, cities: [] }));

        expect(() => loadSeedData()).toThrow('Failed to load seed data');
    });

    it('throws when the cached file has no metadata at all', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readFileSync.mockReturnValue(JSON.stringify({ cities: [] }));

        expect(() => loadSeedData()).toThrow('Failed to load seed data');
    });
});
