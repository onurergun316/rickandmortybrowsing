export function normalizeError(err: unknown): string {
    const msg = err instanceof Error ? err.message : "Unknown error occurred";

    // Our apiClient throws "Request failed (STATUS)"
    const match = msg.match(/\((\d+)\)/);
    const status = match ? Number(match[1]) : null;

    if (status === 429) return "Too many requests. Please slow down and try again.";
    if (status === 404) return "Page doesn't exist 404";
    if (msg.toLowerCase().includes("aborted")) return ""; // ignore aborted
    if (msg.toLowerCase().includes("timed out")) return "Request timed out. Please try again.";
    if (msg.toLowerCase().includes("failed to fetch")) return "Network error. Please check your connection.";

    return msg;
}
