/** @jest-environment node */
// Pin the contract that write handlers rely on: when the caller may not edit,
// withUserAuthorizedToEdit rejects with the shared 401 ApiError, not a bare
// Error. That is what lets handlers surface the documented status code.
jest.mock('react', () => {
    const actual = jest.requireActual('react');
    return { ...actual, cache: (fn: unknown) => fn };
});

jest.mock('@/auth', () => ({
    auth: jest.fn(),
}));

jest.mock('@/lib/db/prisma', () => ({
    __esModule: true,
    default: { user: { findUnique: jest.fn() } },
}));

import { withUserAuthorizedToEdit } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/api/errors';
import { auth } from '@/auth';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('withUserAuthorizedToEdit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects with a 401 UnauthorizedError when there is no session', async () => {
        mockAuth.mockResolvedValue(null as never);

        await expect(withUserAuthorizedToEdit({ cityId: 'chania' })).rejects.toBeInstanceOf(
            UnauthorizedError
        );
        await expect(withUserAuthorizedToEdit({ cityId: 'chania' })).rejects.toMatchObject({
            statusCode: 401,
            message: 'Not authorized',
        });
    });
});
