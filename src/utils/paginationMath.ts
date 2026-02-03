export type SortOrder = "created_desc" | "created_asc";

// Helper to calculate which API pages we need to fetch to satisfy the UI request
export function calculateFetchStrategy(
    uiPage: number,
    totalCount: number,
    order: SortOrder
): { startPage: number; endPage: number; startIdx: number; endIdx: number } {
    // UI Pages are 1-indexed, size 20.
    // Global Indices are 0-indexed.
    let startIdx = 0;
    let endIdx = 0;

    if (order === "created_asc") {
        startIdx = (uiPage - 1) * 20;
        endIdx = Math.min(startIdx + 20, totalCount);
    } else {
        // Descending: We want the "last" 20 items, then the "previous" 20...
        // Total 826. UI Page 1 needs indices 806-826 (exclusive).
        // Formula: 
        // Top (exclusive) = Total - (uiPage - 1) * 20
        // Bottom (inclusive) = Max(0, Top - 20)
        const top = totalCount - (uiPage - 1) * 20;
        const bottom = Math.max(0, top - 20);

        // We want to fetch the range [bottom, top). 
        startIdx = bottom;
        endIdx = top;
    }

    // Map Global Indices to API Pages (1-indexed, size 20)
    const startPage = Math.floor(startIdx / 20) + 1;
    const endPage = Math.floor((endIdx - 1) / 20) + 1; // -1 because endIdx is exclusive

    return { startPage, endPage, startIdx, endIdx };
}
