import { apiFetch } from "@/lib/api/api-fetch";

import type { ExternalEvent } from "@/types/external-event";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type ExternalEventParams = {
  keyword?: string;

  countryCode?: string;

  size?: number;
};

export type CategorySyncResult = {
  category: string;

  found: number;

  created: number;

  skipped: number;
};

export type SyncAllResult = {
  total_found: number;

  total_created: number;

  total_skipped: number;

  categories: CategorySyncResult[];

  message: string;
};

export type SyncAllPayload = {
  countryCode: string;

  sizePerCategory: number;

  defaultFullPrice: number;

  defaultHalfPrice: number;

  defaultCapacity: number;
};

export async function getExternalEvents(
  params: ExternalEventParams = {},
): Promise<ExternalEvent[]> {
  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }

  if (params.countryCode) {
    searchParams.set("country_code", params.countryCode);
  }

  if (params.size) {
    searchParams.set("size", String(params.size));
  }

  const query = searchParams.toString();

  const response = await apiFetch(
    `${API_URL}/external-events${query ? `?${query}` : ""}`,
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? "Não foi possível consultar a Ticketmaster.",
    );
  }

  return response.json();
}

export async function syncAllTicketmasterCategories(
  payload: SyncAllPayload,
): Promise<SyncAllResult> {
  const response = await apiFetch(`${API_URL}/external-events/sync-all`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      country_code: payload.countryCode,

      size_per_category: payload.sizePerCategory,

      default_full_price: payload.defaultFullPrice,

      default_half_price: payload.defaultHalfPrice,

      default_capacity: payload.defaultCapacity,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? "Não foi possível sincronizar as categorias.",
    );
  }

  return response.json();
}
