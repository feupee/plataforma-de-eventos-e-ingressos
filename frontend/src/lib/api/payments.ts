import type { PaymentSimulationResult } from "@/types/payment";

import { apiFetch } from "@/lib/api/api-fetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function simulatePayment(
  reservationId: number,

  result: "APPROVED" | "REJECTED",
): Promise<PaymentSimulationResult> {
  const response = await apiFetch(`${API_URL}/payments/simulate`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      reservation_id: reservationId,

      result,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? "Não foi possível processar o pagamento.");
  }

  return response.json();
}
