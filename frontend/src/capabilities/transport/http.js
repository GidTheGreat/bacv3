/**
 * Generic HTTP fetch with download progress.
 *
 * Usage:
 * fetchWithProgress("/api/data", {
 *     onProgress: ({ loaded, total, percent }) => {
 *         console.log(percent);
 *     }
 * }).then(data => console.log(data));
 */

export async function fetchWithProgress(
    url,
    {
        method = "GET",
        headers = {},
        body = null,
        signal = undefined,
        onProgress = () => {},
    } = {}
) {
    const response = await fetch(url, {
        method,
        headers,
        body,
        signal,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type") || "";
    const contentLength = Number(response.headers.get("Content-Length")) || 0;

    // Only stream octet-streams.
    if (
        !contentType.includes("application/octet-stream") ||
        !response.body
    ) {
        return response;
    }

    const reader = response.body.getReader();
    const chunks = [];

    let loaded = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        onProgress({
            loaded,
            total: contentLength || null,
            percent: contentLength
                ? (loaded / contentLength) * 100
                : null,
        });
    }

    const blob = new Blob(chunks);

    return {
        blob,
        arrayBuffer: () => blob.arrayBuffer(),
        text: () => blob.text(),
        json: async () => JSON.parse(await blob.text()),
    };
}