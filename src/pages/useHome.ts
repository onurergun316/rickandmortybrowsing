import { useEffect, useRef, useState } from "react";
import type { ApiInfo } from "../models/ApiResponse";
import type { Character } from "../models/Character";
import { rickAndMortyService } from "../services/rickAndMortyService";

export type SortOrder = "created_desc" | "created_asc";

type HomeState = {
  page: number;
  info: ApiInfo | null;
  characters: Character[];
  loading: boolean;
  error: string | null;
  sortOrder: SortOrder;
};

const DEFAULT_SORT: SortOrder = "created_desc";
// 12-item limit removed to show full 20-item API page
// const UI_PAGE_SIZE = 12; // Removed

// Small debounce so rapid clicks are coalesced into ONE request.
// This is a standard way to avoid rate-limit spikes on public APIs.
const FETCH_DEBOUNCE_MS = 250;

// Hard timeout requirement
const REQUEST_TIMEOUT_MS = 15000;

const getInitialPage = () => {
  const p = new URLSearchParams(window.location.search).get("page");
  const n = p ? Number(p) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

function normalizeError(err: unknown): string {
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

export const useHome = () => {
  const [state, setState] = useState<HomeState>({
    page: getInitialPage(),
    info: null,
    characters: [],
    loading: false,
    error: null,
    sortOrder: DEFAULT_SORT,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const abortRef = useRef<AbortController | null>(null);
  const reqSeqRef = useRef(0);
  const debounceTimerRef = useRef<number | null>(null);

  // The core fetch logic
  const performFetch = async (uiPage: number, order: SortOrder) => {
    // 1. Resolve Total Count First
    let totalCount = stateRef.current.info?.count;
    let totalPages = stateRef.current.info?.pages;

    // If metadata is unknown, force a probe fetch of Page 1
    if (!totalCount || !totalPages) {
      // PROBE FETCH
      const seq = ++reqSeqRef.current;
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const data = await rickAndMortyService.getCharacters(1, controller.signal);
        if (seq !== reqSeqRef.current) return;

        // Update info so we know the math
        totalCount = data.info.count;
        totalPages = data.info.pages;

        // Standard: update state with what we found (Page 1)
        setState(prev => ({ ...prev, info: data.info }));

        // If user wanted "Newest", Page 1 is WRONG. We need to re-run logic now that we know count.
        // But if they wanted "Oldest", Page 1 is correct.
        if (order === "created_asc") {
          setState(prev => ({ ...prev, characters: data.results, loading: false, error: null }));
          return;
        }
      } catch (err) {
        // Error handling for probe...
        // If probe fails, we can't proceed.
        if (seq !== reqSeqRef.current) return;
        if (controller.signal.aborted) {
          setState(prev => ({ ...prev, loading: false, error: "Timed out" }));
          return;
        }
        const msg = normalizeError(err);
        if (msg) setState(prev => ({ ...prev, loading: false, error: msg }));
        return;
      }
    }
    // 404 CHECK: Now that we definitely have totalPages, check if we are out of bounds.
    if (totalPages && uiPage > totalPages) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Page doesn't exist 404",
        info: { count: totalCount!, pages: totalPages!, next: null, prev: null }
      }));
      return;
    }

    // 2. Calculate Global Indices needed for this UI Page
    // UI Pages are 1-indexed, size 20.
    // Global Indices are 0-indexed.
    let startIdx = 0;
    let endIdx = 0;

    if (order === "created_asc") {
      startIdx = (uiPage - 1) * 20;
      endIdx = Math.min(startIdx + 20, totalCount!);
    } else {
      // Descending: We want the "last" 20 items, then the "previous" 20...
      // Total 826. UI Page 1 needs indices 806-826 (exclusive).
      // Formula: 
      // Top (exclusive) = Total - (uiPage - 1) * 20
      // Bottom (inclusive) = Max(0, Top - 20)
      const top = totalCount! - (uiPage - 1) * 20;
      const bottom = Math.max(0, top - 20);

      // We want to fetch the range [bottom, top). 
      // Note: We will fetch "Ascending" from API, then Reverse client-side.
      startIdx = bottom;
      endIdx = top;
    }

    // 3. Map Global Indices to API Pages
    // API Pages are 1-indexed, size 20.
    // Index 0 -> Page 1. Index 19 -> Page 1. Index 20 -> Page 2.
    const startPage = Math.floor(startIdx / 20) + 1;
    const endPage = Math.floor((endIdx - 1) / 20) + 1; // -1 because endIdx is exclusive

    const pagesToFetch = [];
    for (let p = startPage; p <= endPage; p++) {
      pagesToFetch.push(p);
    }

    // 4. Fetch Required Pages
    const seq = ++reqSeqRef.current;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Hard timeout
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      // Run fetches in parallel
      const responses = await Promise.all(
        pagesToFetch.map(p => rickAndMortyService.getCharacters(p, controller.signal))
      );

      if (seq !== reqSeqRef.current) return;

      // 5. Stitch & Slice
      // We only care about 'results'. Info we can take from the first one.
      const lastInfo = responses[responses.length - 1].info;

      // Merge all fetched results into one flat array of characters
      // Since pagesToFetch is sorted (e.g. [41, 42]), the data is strictly Ascending by ID.
      const mergedResults = responses.flatMap(r => r.results);

      // Determine "Window Start Index" of the Merged Array
      // The Merged Array starts at Global Index: (startPage - 1) * 20
      const mergedStartGlobalIdx = (startPage - 1) * 20;

      // We want data from 'startIdx' to 'endIdx'.
      // The relative start/end in our Merged Array is:
      const relativeStart = startIdx - mergedStartGlobalIdx;
      const relativeEnd = endIdx - mergedStartGlobalIdx;

      let finalSlice = mergedResults.slice(relativeStart, relativeEnd);

      // 6. Apply Final Sort (Reverse if Needed)
      if (order === "created_desc") {
        finalSlice.reverse();
      }

      setState(prev => ({
        ...prev,
        info: lastInfo,
        characters: finalSlice,
        loading: false,
        error: null,
      }));
    } catch (err) {
      // standard error handling
      if (seq !== reqSeqRef.current) return;
      if (controller.signal.aborted) {
        setState(prev => ({ ...prev, loading: false, error: "Request timed out." }));
        return;
      }
      const msg = normalizeError(err);
      if (msg) setState(prev => ({ ...prev, loading: false, error: msg }));
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const requestPage = (nextPage: number, order: SortOrder = stateRef.current.sortOrder) => {
    // Basic guards
    if (!Number.isFinite(nextPage) || nextPage < 1) return;
    const total = stateRef.current.info?.pages;
    if (total && nextPage > total) return;

    // UX Updates
    window.history.replaceState(null, "", `?page=${nextPage}`);
    setState((prev) => ({ ...prev, page: nextPage, sortOrder: order, loading: true, error: null }));

    // Debounce
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      performFetch(nextPage, order);
    }, FETCH_DEBOUNCE_MS);
  };

  // Initial load
  useEffect(() => {
    requestPage(state.page);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canGoPrev = state.page > 1;
  const canGoNext = state.info?.pages ? state.page < state.info.pages : false;

  const goPrev = () => requestPage(state.page - 1);
  const goNext = () => requestPage(state.page + 1);
  const goToPage = (p: number) => requestPage(p);
  const setSortOrder = (o: SortOrder) => requestPage(state.page, o); // Trigger fetch on sort change

  const dismissError = () => setState((prev) => ({ ...prev, error: null }));

  // Direct pass-through now, sorting is handled at source
  const finalCharacters = state.characters;

  return {
    page: state.page,
    info: state.info,
    loading: state.loading,
    error: state.error,
    sortOrder: state.sortOrder,
    characters: finalCharacters,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    goToPage,
    setSortOrder,
    dismissError,
  };
};