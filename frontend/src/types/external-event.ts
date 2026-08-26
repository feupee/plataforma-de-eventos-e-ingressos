export type ExternalEvent = {
  id: string;

  name: string;

  date: string | null;
  time: string | null;

  venue: string | null;

  city: string | null;
  state: string | null;
  country: string | null;

  image_url: string | null;

  ticketmaster_url: string | null;

  price_min: number | null;
  price_max: number | null;

  currency: string | null;

  category: string | null;
};
