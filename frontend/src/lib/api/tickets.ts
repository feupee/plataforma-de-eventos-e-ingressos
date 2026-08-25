import type { Ticket } from "@/types/ticket";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function getUserTickets(userId: number): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/tickets/user/${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível carregar os ingressos.");
  }

  return response.json();
}

export async function getTicket(ticketId: number): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar o ingresso.");
  }

  return response.json();
}
