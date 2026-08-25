export type TicketStatus = "VALID" | "USED";

export type Ticket = {
  id: number;
  eventName: string;
  date: string;
  time: string;
  location: string;
  ticketType: string;
  price: number;
  image: string;
  code: string;
  status: TicketStatus;
};

export const meusIngressos: Ticket[] = [
  {
    id: 1,
    eventName: "Festival de Música 2026",
    date: "12 de Setembro de 2026",
    time: "20:00",
    location: "Uberlândia - MG",
    ticketType: "Inteira",
    price: 100,
    image: "/carousel/evento1.png",
    code: "8e7d9a23-82ea-4af1-9a37-7f012578b125",
    status: "VALID",
  },
  {
    id: 2,
    eventName: "Festival de Música 2026",
    date: "12 de Setembro de 2026",
    time: "20:00",
    location: "Uberlândia - MG",
    ticketType: "Meia-entrada",
    price: 50,
    image: "/carousel/evento1.png",
    code: "a43c7621-5d34-41ba-bc45-1047d981c125",
    status: "VALID",
  },
  {
    id: 3,
    eventName: "Tech Conference",
    date: "20 de Setembro de 2026",
    time: "09:00",
    location: "São Paulo - SP",
    ticketType: "Inteira",
    price: 120,
    image: "/carousel/evento2.png",
    code: "c278e49a-a37c-4758-a5c8-43e80abb3109",
    status: "VALID",
  },
];
