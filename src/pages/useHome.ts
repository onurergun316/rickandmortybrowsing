import { useEffect, useMemo, useRef, useState } from "react";
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
  if (status === 404) return "Page not found.";
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

  // Abort in-flight requests when a new page is requested
  const abortRef = useRef<AbortController | null>(null);

  // Ignore stale responses
  const reqSeqRef = useRef(0);

  // Debounce/coalesce rapid page changes
  const debounceTimerRef = useRef<number | null>(null);
  const pendingPageRef = useRef<number>(state.page);

  const requestPage = (nextPage: number) => {
    // Clamp basic range (we can clamp upper bound only if we know total pages)
    if (!Number.isFinite(nextPage) || nextPage < 1) return;
    if (state.info?.pages && nextPage > state.info.pages) return;

    // Update URL immediately for UX (you asked URL should reflect page)
    window.history.replaceState(null, "", `?page=${nextPage}`);

    // Update page state immediately (UI shows correct "current page")
    setState((prev) => ({
      ...prev,
      page: nextPage,
      // Keep existing characters visible while loading new page (better UX)
      loading: true,
      error: null,
    }));

    // Debounce actual fetch
    pendingPageRef.current = nextPage;
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      const pageToFetch = pendingPageRef.current;
      const seq = ++reqSeqRef.current;

      // Abort previous
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Hard timeout
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      (async () => {
        try {
          const data = await rickAndMortyService.getCharacters(pageToFetch, controller.signal);

          // Ignore stale response
          if (seq !== reqSeqRef.current) return;

          setState((prev) => ({
            ...prev,
            info: data.info,
            characters: data.results,
            loading: false,
            error: null,
          }));
        } catch (err) {
          // Ignore stale or aborted
          if (seq !== reqSeqRef.current) return;
          if (controller.signal.aborted) {
            // If aborted by timeout, show timeout message. If aborted because user clicked fast, ignore.
            // We can detect timeout by checking if loading is still true and the abort happened after timeout,
            // but simplest is: if still loading and no new request replaced it, show timeout.
            // We'll show a timeout only if this is the latest request and still aborted.
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "Request timed out. Please try again.",
            }));
            return;
          }

          const message = normalizeError(err);
          if (!message) return;

          setState((prev) => ({
            ...prev,
            loading: false,
            error: message,
          }));
        } finally {
          window.clearTimeout(timeoutId);
        }
      })();
    }, FETCH_DEBOUNCE_MS);
  };

  // Initial load (or when user manually changes URL and refreshes)
  useEffect(() => {
    requestPage(state.page);

    // cleanup on unmount
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedCharacters = useMemo(() => {
    const copy = [...state.characters];

    copy.sort((a, b) => {
      const aTime = new Date(a.created).getTime();
      const bTime = new Date(b.created).getTime();
      return state.sortOrder === "created_asc" ? aTime - bTime : bTime - aTime;
    });

    return copy;
  }, [state.characters, state.sortOrder]);

  const canGoPrev = state.page > 1 && Boolean(state.info?.prev);
  const canGoNext =
    state.info?.pages ? state.page < state.info.pages : Boolean(state.info?.next);

  const goPrev = () => requestPage(state.page - 1);
  const goNext = () => requestPage(state.page + 1);
  const goToPage = (page: number) => requestPage(page);

  const setSortOrder = (sortOrder: SortOrder) => {
    setState((prev) => ({ ...prev, sortOrder }));
  };

  return {
    page: state.page,
    info: state.info,
    loading: state.loading,
    error: state.error,
    sortOrder: state.sortOrder,
    characters: sortedCharacters,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    goToPage,
    setSortOrder,
  };
};