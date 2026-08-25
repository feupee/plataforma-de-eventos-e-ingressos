import type {
  CreateEventPayload,
  Event,
  EventStatus,
  UpdateEventPayload,
} from "@/types/event";

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

  if (params.organizerId !== undefined) {
    queryParams.set("organizer_id", String(params.organizerId));
  }

  const query = queryParams.toString();

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

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? `Erro ao criar evento: ${response.status}`,
    );
  }

  return response.json();
}

export async function updateEvent(
  eventId: number,
  payload: UpdateEventPayload,
): Promise<Event> {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? `Erro ao atualizar evento: ${response.status}`,
    );
  }

  return response.json();
}

export async function deleteEvent(eventId: number): Promise<void> {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erro ao excluir evento: ${response.status}`);
  }
}
