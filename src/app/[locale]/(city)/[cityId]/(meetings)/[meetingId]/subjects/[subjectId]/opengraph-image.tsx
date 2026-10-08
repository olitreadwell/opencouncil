// See src/app/api/og/route.tsx for why we use @vercel/og directly instead of next/og.
import { ImageResponse } from "@vercel/og";
import type { ReactElement } from "react";
import { LOGO_BLACK_DATA_URI, OG_FONTS } from "@/lib/og/serverAssets";
import { ogCacheControl } from "@/lib/og/render";
import { subjectOgElement, SUBJECT_OG_SIZE } from "@/lib/og/subjectImage";
import { OgBody, OgBrand, OgFrame } from "@/components/og/frame";

// Image configuration
export const size = SUBJECT_OG_SIZE;

export const contentType = "image/png";

/** What a reader gets when the subject's own image cannot be drawn: the mark on the frame's ground. */
function fallbackElement(): ReactElement {
    return (
        <OgFrame>
            <OgBody left={<OgBrand markSrc={LOGO_BLACK_DATA_URI} size={44} />} />
        </OgFrame>
    );
}

/**
 * Draw an element and hand back its PNG bytes. An ImageResponse renders when
 * its body is read, so the bytes are read here: satori then runs inside the
 * caller's try, and a failure is answered instead of escaping while Next
 * pipes the body as a framework-level `failed to pipe response`.
 */
async function pngResponse(element: ReactElement, settled: boolean): Promise<Response> {
    const image = new ImageResponse(element, {
        ...size,
        fonts: OG_FONTS,
        headers: { "Cache-Control": ogCacheControl(settled) },
    });
    return new Response(await image.arrayBuffer(), { status: 200, headers: image.headers });
}

/**
 * The subject page's unfurl; `src/lib/og/subjectImage.tsx` draws it, and /api/og draws the same element inside its slot.
 * A renderer failure answers with the mark alone, cached for an hour, rather than
 * erroring the unfurl and paging the alert channel.
 */
export default async function SubjectOgImage({
    params,
}: {
    params: Promise<{
        locale: string;
        cityId: string;
        meetingId: string;
        subjectId: string;
    }>;
}) {
    const { locale, cityId, meetingId, subjectId } = await params;
    try {
        const { element, settled } = await subjectOgElement(locale, cityId, meetingId, subjectId);
        return await pngResponse(element, settled);
    } catch (error) {
        console.error("[og] subject unfurl could not be drawn; answering with the mark", error);
        try {
            return await pngResponse(fallbackElement(), false);
        } catch (fallbackError) {
            console.error("[og] subject unfurl fallback could not be drawn either", fallbackError);
            return new Response("Failed to generate image", {
                status: 500,
                headers: { "Cache-Control": "private, no-store" },
            });
        }
    }
}
