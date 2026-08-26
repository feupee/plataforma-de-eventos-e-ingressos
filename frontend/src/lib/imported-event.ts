import type { ExternalEvent } from "@/types/external-event";

const STORAGE_KEY = "ingressolivre_imported_event";

export type ImportedEventDraft = {
  title: string;

  description: string;

  category: string;

  event_date: string;

  location: string;

  image_url: string;

  source_url: string;
};

function mapCategory(category: string | null) {
  switch (category) {
    case "Music":
      return "Shows & músicas";

    case "Sports":
      return "Esportes";

    case "Arts & Theatre":
      return "Teatro";

    case "Film":
      return "Cinema";

    default:
      return "Outros";
  }
}

function buildLocation(event: ExternalEvent) {
  const parts = [event.venue, event.city, event.state, event.country].filter(
    Boolean,
  );

  return parts.join(" - ");
}

function buildDateTime(event: ExternalEvent) {
  if (!event.date) {
    return "";
  }

  const time = event.time ? event.time.slice(0, 5) : "12:00";

  return `${event.date}T${time}`;
}

export function saveImportedEvent(event: ExternalEvent) {
  const draft: ImportedEventDraft = {
    title: event.name,

    description: event.ticketmaster_url
      ? "Evento importado da Ticketmaster. " +
        `Página original: ${event.ticketmaster_url}`
      : "Evento importado da Ticketmaster.",

    category: mapCategory(event.category),

    event_date: buildDateTime(event),

    location: buildLocation(event),

    image_url: event.image_url ?? "",

    source_url: event.ticketmaster_url ?? "",
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function consumeImportedEvent(): ImportedEventDraft | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(stored) as ImportedEventDraft;
  } catch {
    return null;
  }
}
