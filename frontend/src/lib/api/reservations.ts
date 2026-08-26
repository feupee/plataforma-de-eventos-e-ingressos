import type {
  CreateReservationPayload,
  EventAvailability,
  Reservation,
} from "@/types/reservation";

import { apiFetch } from "@/lib/api/api-fetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<Reservation> {
  const response = await apiFetch(`${API_URL}/reservations`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível criar a reserva.");
  }

  return response.json();
}

export async function getReservation(
  reservationId: number,
): Promise<Reservation> {
  const response = await apiFetch(`${API_URL}/reservations/${reservationId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível carregar a reserva.");
  }

  return response.json();
}

export async function getEventAvailability(
  eventId: number,
): Promise<EventAvailability> {
  const response = await fetch(
    `${API_URL}/reservations/events/${eventId}/availability`,
  );

  if (!response.ok) {
    throw new Error("Não foi possível consultar a disponibilidade.");
  }

  return response.json();
}
