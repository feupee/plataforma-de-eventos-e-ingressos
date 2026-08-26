import type { SharedTicket, Ticket, TicketValidation } from "@/types/ticket";

import { apiFetch } from "@/lib/api/api-fetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function getMyTickets(): Promise<Ticket[]> {
  const response = await apiFetch(`${API_URL}/tickets/me`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível carregar os ingressos.");
  }

  return response.json();
}

export async function getTicket(ticketId: number): Promise<Ticket> {
  const response = await apiFetch(`${API_URL}/tickets/${ticketId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível carregar o ingresso.");
  }

  return response.json();
}

export async function validateTicket(
  code: string,

  eventId: number,
): Promise<TicketValidation> {
  const response = await apiFetch(`${API_URL}/tickets/validate`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      code,

      event_id: eventId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível validar o ingresso.");
  }

  return response.json();
}

export async function getSharedTicket(code: string): Promise<SharedTicket> {
  const response = await fetch(
    `${API_URL}/tickets/share/${encodeURIComponent(code)}`,
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível carregar o ingresso.");
  }

  return response.json();
}
