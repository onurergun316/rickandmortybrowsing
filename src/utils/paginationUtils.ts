export type PageItem =
    | { type: "page"; value: number; active: boolean }
    | { type: "ellipsis"; key: string };

export function buildPageItems(current: number, total: number): PageItem[] {
    // A common pattern: show first + last + a window around current
    const windowSize = 2; // current-2 ... current+2
    const pages = new Set<number>();

    pages.add(1);
    pages.add(total);

    for (let p = current - windowSize; p <= current + windowSize; p++) {
        if (p >= 1 && p <= total) pages.add(p);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);

    const items: PageItem[] = [];
    for (let i = 0; i < sorted.length; i++) {
        const val = sorted[i];
        const prev = sorted[i - 1];

        if (i > 0 && prev !== undefined && val - prev > 1) {
            items.push({ type: "ellipsis", key: `e-${prev}-${val}` });
        }

        items.push({ type: "page", value: val, active: val === current });
    }

    return items;
}
