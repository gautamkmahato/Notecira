let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessTokenOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

/** Fetch with credentials; on 401, refresh session once and retry. */
export async function fetchWithSessionRefresh(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === "string" ? input : input.toString();
  const options: RequestInit = {
    ...init,
    credentials: init?.credentials ?? "include",
  };

  let response = await fetch(input, options);
  if (
    response.status !== 401 ||
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/signout")
  ) {
    return response;
  }

  const refreshed = await refreshAccessTokenOnce();
  if (!refreshed) {
    return response;
  }

  return fetch(input, options);
}
