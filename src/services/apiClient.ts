const BASE_URL = "https://rickandmortyapi.com/api";
const REQUEST_TIMEOUT_MS = 15000;

export const apiClient = {
  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

    // If caller provides a signal, we still want timeout.
    // If either aborts, the request will abort.
    const combinedSignal = signal
      ? anySignal([signal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        signal: combinedSignal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        throw new Error(`Request failed (${response.status})`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new Error("Request timed out after 15 seconds.");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

// Combines multiple AbortSignals into one
function anySignal(signals: AbortSignal[]) {
  const controller = new AbortController();

  const onAbort = () => controller.abort();

  for (const s of signals) {
    if (s.aborted) {
      controller.abort();
      return controller.signal;
    }
    s.addEventListener("abort", onAbort, { once: true });
  }

  return controller.signal;
}