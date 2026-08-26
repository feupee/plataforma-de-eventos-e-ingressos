import type { ExternalEvent } from "@/types/external-event";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type ExternalEventParams = {
  keyword?: string;

  city?: string;

  countryCode?: string;

  size?: number;
};

export async function getExternalEvents(
  params: ExternalEventParams = {},
): Promise<ExternalEvent[]> {
  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }

  if (params.city) {
    searchParams.set("city", params.city);
  }

  if (params.countryCode) {
    searchParams.set("country_code", params.countryCode);
  }

  if (params.size) {
    searchParams.set("size", String(params.size));
  }

  const query = searchParams.toString();

  const response = await fetch(
    `${API_URL}/external-events${query ? `?${query}` : ""}`,
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? "Não foi possível consultar eventos externos.",
    );
  }

  return response.json();
}
