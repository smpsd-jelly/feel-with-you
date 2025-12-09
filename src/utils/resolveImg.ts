export const API_BASE =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "http://localhost:4000";

/** Turn whatever the DB gives you into a browser-usable src */
export function resolveImgSrc(
    dbImgUrl?: string | null,
    fallback?: string
): string | undefined {
    if (!dbImgUrl) return fallback;

    // absolute (http/https/data/base64) → use as-is
    if (/^(https?:)?\/\//.test(dbImgUrl) || dbImgUrl.startsWith("data:")) {
        return dbImgUrl;
    }
    // relative (starts with /images/...) → prefix API base
    if (dbImgUrl.startsWith("/")) {
        return `${API_BASE}${dbImgUrl}`;
    }
    // something else (already relative to Next.js) → return as-is
    return dbImgUrl;
}
