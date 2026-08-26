import type {
  CreateEventPayload,
  Event,
  EventStatus,
  UpdateEventPayload,
} from "@/types/event";

import { apiFetch } from "@/lib/api/api-fetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type GetEventsParams = {
  search?: string;
  category?: string;

  status?: EventStatus;

  organizerId?: number;
};

export async function getEvents(
  params: GetEventsParams = {},
): Promise<Event[]> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.organizerId !== undefined) {
    searchParams.set("organizer_id", String(params.organizerId));
  }

  const query = searchParams.toString();

  const response = await fetch(`${API_URL}/events${query ? `?${query}` : ""}`);

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

export async function getMyEvents(): Promise<Event[]> {
  const response = await apiFetch(`${API_URL}/events/mine`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível carregar seus eventos.");
  }

  return response.json();
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const response = await apiFetch(`${API_URL}/events`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível criar o evento.");
  }

  return response.json();
}

export async function updateEvent(
  eventId: number,
  payload: UpdateEventPayload,
): Promise<Event> {
  const response = await apiFetch(`${API_URL}/events/${eventId}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível atualizar o evento.");
  }

  return response.json();
}

export async function deleteEvent(eventId: number): Promise<void> {
  const response = await apiFetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível excluir o evento.");
  }
}
