export type PaymentStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED";

export type PaymentSimulationResult = {
  payment_id: number;
  reservation_id: number;

  payment_status: PaymentStatus;

  reservation_status: "PENDING" | "APPROVED" | "CANCELLED" | "EXPIRED";

  ticket_count: number;

  message: string;
};
