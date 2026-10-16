const KEY = "auth:v1";

export type Tokens = { accessToken: string; refreshToken: string };

function safeRead(storage: () => Storage): Tokens | null {
  try {
    const raw = storage().getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.accessToken === "string" &&
      typeof parsed?.refreshToken === "string"
      ? parsed
      : null;
  } catch {
    return null; // missing, corrupt, or storage blocked
  }
}

/** Tokens from localStorage ("remember me") or sessionStorage (tab only). */
export function getTokens(): Tokens | null {
  return safeRead(() => localStorage) ?? safeRead(() => sessionStorage);
}

export function clearTokens() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Save tokens. `remember` picks localStorage (true) or sessionStorage (false).
 * When omitted (e.g. after a token refresh) they stay where they already were.
 */
export function saveTokens(tokens: Tokens, remember?: boolean) {
  const useLocal = remember ?? !!safeRead(() => localStorage);
  clearTokens();
  try {
    (useLocal ? localStorage : sessionStorage).setItem(
      KEY,
      JSON.stringify(tokens),
    );
  } catch {
    // Storage blocked: user stays signed in until the page is closed
  }
}
