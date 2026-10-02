/** @jest-environment node */
// POST /api/cities/[cityId]/parties documents a 401 for callers who may not
// edit. withUserAuthorizedToEdit throws an ApiError, so the handler must hand
// that error to handleApiError instead of flattening it into the generic 500.
jest.mock('@/lib/auth', () => ({
    withUserAuthorizedToEdit: jest.fn(),
}));

jest.mock('@/lib/db/parties', () => ({
    getPartiesForCity: jest.fn(),
    createParty: jest.fn(),
}));

jest.mock('@/lib/s3', () => ({
    uploadFile: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
    revalidateTag: jest.fn(),
}));

import { POST } from '../route';
import { withUserAuthorizedToEdit } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/api/errors';

const mockWithUserAuthorizedToEdit = withUserAuthorizedToEdit as jest.MockedFunction<
    typeof withUserAuthorizedToEdit
>;

const props = { params: Promise.resolve({ cityId: 'chania' }) };

describe('POST /api/cities/[cityId]/parties', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('returns 401 with the API error body when the caller is not authorized', async () => {
        mockWithUserAuthorizedToEdit.mockRejectedValue(new UnauthorizedError('Not authorized'));

        const res = await POST({} as never, props);

        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'Not authorized' });
    });

    it('keeps returning 500 for an unexpected failure', async () => {
        mockWithUserAuthorizedToEdit.mockRejectedValue(new Error('boom'));

        const res = await POST({} as never, props);

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'Failed to create party' });
    });
});
