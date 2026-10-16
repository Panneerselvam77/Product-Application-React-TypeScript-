import { clearTokens, getTokens, saveTokens } from "./authStorage";

const BASE = "https://dummyjson.com";

// Access token lifetime requested from the server. Set to 1 while testing
// to watch the automatic refresh happen.
const ACCESS_TTL_MINS = 30;

/** Fired when the session can't be recovered (refresh token expired/invalid). */
export const AUTH_EXPIRED_EVENT = "auth:expired";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
  phone?: string;
  birthDate?: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  company?: {
    name?: string;
    title?: string;
    department?: string;
  };
};

async function errorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return (data as { message?: string } | null)?.message || fallback;
}

// ---------- Token refresh ----------

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return false;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
        expiresInMins: ACCESS_TTL_MINS,
      }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    const accessToken = data.accessToken ?? data.token;
    if (!accessToken) return false;

    // Keep the same storage (local/session) the tokens were already in
    saveTokens({
      accessToken,
      refreshToken: data.refreshToken ?? tokens.refreshToken,
    });
    return true;
  } catch {
    return false;
  }
}

/** Several requests failing at once share a single refresh call. */
function refreshTokens(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/**
 * fetch() with the access token attached. On 401/403 it refreshes the token
 * once and retries. If refresh fails, the session is cleared and
 * AUTH_EXPIRED_EVENT is fired. Use this for every protected endpoint.
 */
export async function authFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const send = () =>
    fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
        Authorization: `Bearer ${getTokens()?.accessToken ?? ""}`,
      },
    });

  let res = await send();

  if (res.status === 401 || res.status === 403) {
    if (await refreshTokens()) {
      res = await send();
    } else {
      clearTokens();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw new Error("Session expired. Please sign in again.");
    }
  }

  return res;
}

// ---------- Endpoints ----------

export async function getCurrentUser(): Promise<AuthUser> {
  const res = await authFetch("/auth/me");
  if (!res.ok)
    throw new Error(await errorMessage(res, "Couldn't load profile"));
  return res.json();
}

/** Logs in, stores the tokens, and returns the full user profile. */
export async function login(
  username: string,
  password: string,
  remember: boolean,
): Promise<AuthUser> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      expiresInMins: ACCESS_TTL_MINS,
    }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Login failed"));

  const data = await res.json();
  const accessToken = data.accessToken ?? data.token;
  if (!accessToken || !data.refreshToken) {
    throw new Error("Unexpected response from the server");
  }

  saveTokens({ accessToken, refreshToken: data.refreshToken }, remember);

  try {
    return await getCurrentUser();
  } catch (err) {
    clearTokens(); // don't leave half-signed-in tokens behind
    throw err;
  }
}
