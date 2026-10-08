jest.mock('@vercel/og', () => ({ ImageResponse: jest.fn() }));
jest.mock('next/og', () => ({ ImageResponse: jest.fn() }));
jest.mock('@/lib/og/serverAssets', () => ({ OG_FONTS: [], LOGO_BLACK_DATA_URI: 'data:image/png;base64,mark' }));
jest.mock('@/lib/og/subjectImage', () => ({ SUBJECT_OG_SIZE: { width: 1200, height: 630 }, subjectOgElement: jest.fn() }));

import { ImageResponse } from '@vercel/og';
import { subjectOgElement } from '@/lib/og/subjectImage';
import SubjectOgImage from '@/app/[locale]/(city)/[cityId]/(meetings)/[meetingId]/subjects/[subjectId]/opengraph-image';

const mockedImageResponse = ImageResponse as unknown as jest.Mock;
const mockedSubjectOgElement = subjectOgElement as jest.Mock;

/**
 * The vendored ImageResponse declares `content-type: image/png` and renders on
 * body read; the body here yields the bytes, or throws the way satori does when
 * it cannot draw the element.
 */
function draw(bytes: string, throws = false) {
    return (_element: unknown, options: { headers?: Record<string, string> }) => ({
        headers: new Headers({ 'content-type': 'image/png', ...options?.headers }),
        arrayBuffer: async () => {
            if (throws) throw new Error('satori could not draw the element');
            return new TextEncoder().encode(bytes).buffer;
        },
    });
}

const params = {
    params: Promise.resolve({ locale: 'en', cityId: 'athens', meetingId: 'm1', subjectId: 's1' }),
};

beforeEach(() => {
    mockedImageResponse.mockReset();
    mockedSubjectOgElement.mockReset();
    mockedSubjectOgElement.mockResolvedValue({ element: null, settled: true });
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

it('answers the unfurl with the rendered subject image and its settled cache', async () => {
    mockedImageResponse.mockImplementation(draw('subject-bytes'));
    const response = await SubjectOgImage(params);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, no-transform, max-age=604800');
    expect(await response.text()).toContain('subject-bytes');
});

it('answers with the mark, cached for an hour, when the renderer cannot draw the subject', async () => {
    mockedImageResponse.mockImplementationOnce(draw('', true)).mockImplementationOnce(draw('mark-bytes'));
    const response = await SubjectOgImage(params);
    expect(mockedImageResponse).toHaveBeenCalledTimes(2);
    expect(mockedImageResponse.mock.calls[1][0]).toBeTruthy();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, no-transform, max-age=3600');
    expect(await response.text()).toContain('mark-bytes');
});

it('answers 500 rather than letting the failure escape when even the mark cannot be drawn', async () => {
    mockedImageResponse.mockImplementation(draw('', true));
    const response = await SubjectOgImage(params);
    expect(response.status).toBe(500);
    expect(mockedImageResponse).toHaveBeenCalledTimes(2);
});
