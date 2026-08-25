export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type Event = {
  id: number;
  organizer_id: number;

  title: string;
  description: string;
  category: string;

  event_date: string;
  location: string;

  full_price: string;
  half_price: string;

  capacity: number;

  image_url: string | null;
  age_rating: string;

  status: EventStatus;
  created_at: string;
};

export type CreateEventPayload = {
  organizer_id: number;

  title: string;
  description: string;
  category: string;

  event_date: string;
  location: string;

  full_price: number;
  half_price: number;

  capacity: number;

  image_url?: string | null;
  age_rating: string;

  status: EventStatus;
};

export type UpdateEventPayload = {
  title?: string;
  description?: string;
  category?: string;

  event_date?: string;
  location?: string;

  full_price?: number;
  half_price?: number;

  capacity?: number;

  image_url?: string | null;
  age_rating?: string;

  status?: EventStatus;
};
