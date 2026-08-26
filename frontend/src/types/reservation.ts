export type ReservationStatus =
  "PENDING" | "APPROVED" | "CANCELLED" | "EXPIRED";

export type Reservation = {
  id: number;

  user_id: number;
  event_id: number;

  full_quantity: number;

  half_quantity: number;

  total_amount: string;

  status: ReservationStatus;

  created_at: string;
};

export type CreateReservationPayload = {
  event_id: number;

  full_quantity: number;

  half_quantity: number;
};

export type EventAvailability = {
  event_id: number;

  capacity: number;

  reserved: number;

  available: number;
};
