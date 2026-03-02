import { BACKEND_URL } from "../config/api";

export class HttpError extends Error {
  status: number;
  bodyText?: string;

  constructor(status: number, message: string, bodyText?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

let refreshPromise: Promise<boolean> | null = null;

type HttpOptions = RequestInit & { _retry?: boolean };

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export const httpClient = async <T>(
  url: string,
  options: HttpOptions,
): Promise<T> => {
  const fullUrl = `${BACKEND_URL}/${url}`;
  const isRefreshCall =
    url.startsWith("auth/refresh") || url.includes("/auth/refresh");

  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
    credentials: options.credentials ?? "include",
  });

  if (response.status === 204) return undefined as T;

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  if (response.status === 401 && !isRefreshCall && !options._retry) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      return httpClient<T>(url, { ...options, _retry: true });
    }
  }

  const text = await response.text();
  throw new HttpError(
    response.status,
    response.status === 401 ? "Unauthorized" : "Request failed",
    text,
  );
};
