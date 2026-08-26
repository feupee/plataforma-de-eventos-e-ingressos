import { getToken } from "@/lib/auth";

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getToken();

  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
