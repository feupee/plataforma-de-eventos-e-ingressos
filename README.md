# 🎟️ IngressoLivre

O **IngressoLivre** é uma plataforma web para criação, descoberta, reserva e validação de ingressos para eventos.

O projeto reúne em uma única aplicação o fluxo completo de um evento:

```text
Criação do evento
      ↓
Publicação
      ↓
Descoberta pelo cliente
      ↓
Reserva
      ↓
Pagamento
      ↓
Ingresso com QR Code
      ↓
Validação na entrada
```

A plataforma possui três tipos de usuário:

- **Cliente**
- **Organizador**
- **Portaria**

Além disso, o catálogo pode ser alimentado com eventos obtidos através da **Ticketmaster Discovery API**.

---

## 🌐 Acesse o projeto

### Aplicação

https://ingressolivre-eta.vercel.app/cliente

### API

https://ingressolivre-api.vercel.app

### Documentação interativa da API

https://ingressolivre-api.vercel.app/docs

---

# 👤 Como funciona a plataforma?

## Cliente

O cliente utiliza a plataforma para descobrir eventos e adquirir ingressos.

Na página inicial ele pode navegar entre eventos, categorias e recomendações.

Depois de selecionar um evento, pode consultar suas informações, como:

- data;
- localização;
- preço;
- disponibilidade.

O fluxo de compra é:

```text
Cliente
   ↓
Escolhe um evento
   ↓
Seleciona a quantidade
   ↓
Cria uma reserva
   ↓
Realiza o pagamento simulado
   ↓
Recebe o ingresso
   ↓
Acessa o QR Code
```

Após a aprovação do pagamento, os ingressos ficam disponíveis na área **Meus ingressos**.

Cada ingresso possui um QR Code próprio e também pode ser compartilhado através de um link da aplicação.

---

## 🧑‍💼 Organizador

O organizador é responsável pelos eventos disponibilizados na plataforma.

Ele pode criar um evento manualmente definindo:

- nome;
- descrição;
- categoria;
- data;
- local;
- preço;
- capacidade;
- imagem.

Também é possível utilizar a integração com a **Ticketmaster** para importar eventos externos.

A sincronização transforma os eventos encontrados pela Ticketmaster em eventos internos do IngressoLivre.

```text
Ticketmaster
     ↓
Sincronização
     ↓
Evento salvo no IngressoLivre
     ↓
Evento publicado
     ↓
Reserva e venda de ingressos
```

Depois de sincronizado, o evento passa a utilizar normalmente todos os recursos da plataforma, incluindo:

- reservas;
- pagamentos;
- ingressos;
- QR Codes;
- validação na portaria.

---

## 🎫 Portaria

A portaria é responsável pela validação dos ingressos na entrada dos eventos.

O operador seleciona o evento e pode validar um ingresso através de:

- leitura do QR Code pela câmera;
- inserção manual do código.

O sistema verifica se o ingresso:

```text
existe
+
pertence ao evento
+
não foi utilizado
+
não foi cancelado
```

O resultado pode ser:

| Resultado     | Significado              |
| ------------- | ------------------------ |
| `VALID`       | Ingresso válido          |
| `USED`        | Ingresso já utilizado    |
| `INVALID`     | Código inválido          |
| `WRONG_EVENT` | Ingresso de outro evento |
| `CANCELLED`   | Ingresso cancelado       |

Quando um ingresso válido é utilizado, ele passa imediatamente para o estado:

```text
USED
```

impedindo que seja utilizado novamente.

---

# 🔄 Fluxo completo

Os três perfis se conectam no fluxo principal da aplicação:

```text
             ORGANIZADOR
                  │
                  ▼
        Cria ou importa evento
                  │
                  ▼
          Evento publicado
                  │
                  ▼
               CLIENTE
                  │
                  ▼
               Reserva
                  │
                  ▼
         Pagamento simulado
                  │
                  ▼
          Ingresso + QR Code
                  │
                  ▼
              PORTARIA
                  │
                  ▼
        Validação do ingresso
```

---

# 🌎 Integração com Ticketmaster

O IngressoLivre utiliza a **Ticketmaster Discovery API** como fonte externa de eventos.

A Ticketmaster fornece informações como:

- nome;
- data;
- local;
- imagens;
- categoria;
- informações de preço quando disponíveis.

Esses eventos são normalizados pelo backend e armazenados no PostgreSQL.

```text
Ticketmaster Discovery API
            ↓
         FastAPI
            ↓
       Normalização
            ↓
      Neon PostgreSQL
            ↓
   Catálogo IngressoLivre
```

A Ticketmaster é utilizada apenas como **fonte de dados**.

Reservas, pagamentos, ingressos e validações são controlados pelo próprio IngressoLivre.

---

# ✨ Funcionalidades

### Cliente

- cadastro e login;
- catálogo de eventos;
- busca;
- filtros por categoria;
- visualização de eventos;
- consulta de disponibilidade;
- reserva;
- ingresso inteiro e meia-entrada;
- pagamento simulado;
- área Meus ingressos;
- QR Code individual;
- compartilhamento por link.

### Organizador

- login próprio;
- criação de eventos;
- publicação de eventos;
- gerenciamento dos próprios eventos;
- consulta à Ticketmaster;
- importação individual;
- sincronização em massa por categorias.

### Portaria

- login próprio;
- seleção de evento;
- leitura de QR Code;
- validação manual;
- prevenção de dupla utilização;
- validação de ingresso pertencente ao evento correto.

---

# 🧰 Tecnologias

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- next-themes

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- Argon2
- HTTPX

## Banco de dados

- PostgreSQL
- Neon

## Integrações e infraestrutura

- Ticketmaster Discovery API
- Vercel
- Neon
- GitHub

---

# 🏗️ Arquitetura

```text
                   ┌─────────────────────┐
                   │     Ticketmaster    │
                   │    Discovery API    │
                   └──────────┬──────────┘
                              │
                              ▼
┌───────────────────┐   ┌─────────────────────┐
│                   │   │                     │
│      Next.js      │──▶│       FastAPI       │
│      Vercel       │   │       Vercel        │
│                   │   │                     │
└───────────────────┘   └──────────┬──────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │                     │
                         │   Neon PostgreSQL   │
                         │                     │
                         └─────────────────────┘
```

---

# 🔐 Perfis

A aplicação utiliza três perfis:

| Perfil      | Função                       |
| ----------- | ---------------------------- |
| `CLIENT`    | Reserva e consulta ingressos |
| `ORGANIZER` | Cria e gerencia eventos      |
| `GATE`      | Valida ingressos             |

As permissões são verificadas pelo backend através de autenticação JWT.

---

# 🧪 Contas de demonstração

## Cliente

```text
E-mail: cliente@ingressolivre.local
Senha: cliente123
```

## Cliente 2

```text
E-mail: cliente2@ingressolivre.local
Senha: cliente123
```

## Organizador

```text
E-mail: organizador@ingressolivre.local
Senha: organizador123
```

## Portaria

```text
E-mail: portaria@ingressolivre.local
Senha: portaria123
```

---

# 🚀 Executando localmente

## Backend

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

No Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale as dependências:

```bash
python -m pip install -r requirements.txt
```

Crie:

```text
backend/.env
```

Exemplo:

```env
DATABASE_URL=postgresql+psycopg://usuario:senha@localhost:5432/eventos_db
JWT_SECRET=sua-chave-secreta
TICKETMASTER_API_KEY=sua-chave-ticketmaster
FRONTEND_URL=http://localhost:3000
```

Execute:

```bash
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

```bash
cd frontend
npm install
```

Crie:

```text
frontend/.env.local
```

com:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Execute:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000/cliente
```

---

# 🔒 Variáveis de ambiente

Dados sensíveis não devem ser versionados.

### Backend

```text
DATABASE_URL
JWT_SECRET
TICKETMASTER_API_KEY
FRONTEND_URL
```

### Frontend

```text
NEXT_PUBLIC_API_URL
```

---

# 📚 Documentação técnica

Os detalhes de arquitetura, banco de dados, autenticação, regras de negócio, concorrência e endpoints estão disponíveis em:

[`DOCUMENTACAO.md`](DOCUMENTACAO.md)

---

# 📌 Status

- [x] autenticação;
- [x] perfis de acesso;
- [x] catálogo;
- [x] busca;
- [x] categorias;
- [x] criação de eventos;
- [x] integração Ticketmaster;
- [x] sincronização de eventos;
- [x] reservas;
- [x] controle de disponibilidade;
- [x] pagamento simulado;
- [x] geração de ingressos;
- [x] QR Code;
- [x] compartilhamento;
- [x] validação pela portaria;
- [x] prevenção contra reutilização;
- [x] PostgreSQL em produção;
- [x] frontend publicado;
- [x] backend publicado.

---

# 👨‍💻 Autor

**Felipe**

Projeto desenvolvido como desafio Full Stack para construção de uma plataforma de eventos e ingressos.
