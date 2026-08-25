export const todosEventos = [
  {
    id: 1,
    title: "Festival de Música 2026",
    category: "Shows & Música",
    date: "12 de Setembro de 2026",
    location: "Uberlândia - MG",
    price: 100,
    image: "/carousel/evento1.png",
  },
  {
    id: 2,
    title: "Tech Conference",
    category: "Tecnologia",
    date: "20 de Setembro de 2026",
    location: "São Paulo - SP",
    price: 120,
    image: "/carousel/evento2.png",
  },
  {
    id: 3,
    title: "Festival Gastronômico",
    category: "Gastronomia",
    date: "28 de Setembro de 2026",
    location: "Belo Horizonte - MG",
    price: 60,
    image: "/carousel/evento3.png",
  },
  {
    id: 4,
    title: "Stand-up Comedy Night",
    category: "Comédia",
    date: "05 de Outubro de 2026",
    location: "Uberlândia - MG",
    price: 50,
    image: "/carousel/evento4.png",
  },
  {
    id: 5,
    title: "Campeonato de E-Sports",
    category: "Esportes",
    date: "18 de Outubro de 2026",
    location: "São Paulo - SP",
    price: 80,
    image: "/carousel/evento5.png",
  },
  {
    id: 6,
    title: "Festival Cultural",
    category: "Arte & Cultura",
    date: "25 de Outubro de 2026",
    location: "Uberaba - MG",
    price: 40,
    image: "/carousel/evento3.png",
  },
  {
    id: 7,
    title: "Encontro de Tecnologia",
    category: "Tecnologia",
    date: "02 de Novembro de 2026",
    location: "Campinas - SP",
    price: 90,
    image: "/carousel/evento2.png",
  },
  {
    id: 8,
    title: "Noite da Comédia",
    category: "Comédia",
    date: "15 de Novembro de 2026",
    location: "Belo Horizonte - MG",
    price: 45,
    image: "/carousel/evento4.png",
  },
  {
    id: 9,
    title: "Festival Gamer",
    category: "Games",
    date: "20 de Novembro de 2026",
    location: "São Paulo - SP",
    price: 75,
    image: "/carousel/evento5.png",
  },
  {
    id: 10,
    title: "Festival Sunset",
    category: "Shows & Música",
    date: "22 de Novembro de 2026",
    location: "São Paulo - SP",
    price: 130,
    image: "/carousel/evento1.png",
  },
];

export const eventosEmAlta = todosEventos.slice(0, 5);

export const recomendacoes = todosEventos.slice(5, 9);

export const showsMusicas = todosEventos.filter(
  (event) => event.category === "Shows & Música",
);

export const esportes = todosEventos.filter(
  (event) => event.category === "Esportes",
);
