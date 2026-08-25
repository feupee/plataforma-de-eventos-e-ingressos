export type TicketType = "FULL" | "HALF";

export type TicketStatus = "VALID" | "USED" | "CANCELLED";

export type TicketEvent = {
  id: number;
  title: string;
  event_date: string;
  location: string;
  image_url: string | null;
};

export type Ticket = {
  id: number;
  reservation_id: number;

  ticket_type: TicketType;

  price: string;

  code: string;
  status: TicketStatus;

  validated_at: string | null;

  event: TicketEvent;
};
