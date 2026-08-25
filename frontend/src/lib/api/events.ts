import type { Event } from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type GetEventsParams = {
  search?: string;
  category?: string;
  status?: string;
};

export async function getEvents(
  params: GetEventsParams = {},
): Promise<Event[]> {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.set("search", params.search);
  }

  if (params.category) {
    queryParams.set("category", params.category);
  }

  if (params.status) {
    queryParams.set("status", params.status);
  }

  const query = queryParams.toString();

  const url = `${API_URL}/events${query ? `?${query}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar eventos: ${response.status}`);
  }

  return response.json();
}

export async function getEvent(eventId: number): Promise<Event> {
  const response = await fetch(`${API_URL}/events/${eventId}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar evento: ${response.status}`);
  }

  return response.json();
}
