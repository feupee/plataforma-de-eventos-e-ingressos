# Documentação Técnica — IngressoLivre

## 1. Introdução

O IngressoLivre é uma aplicação Full Stack destinada à criação, descoberta, reserva, emissão e validação de ingressos para eventos.

A solução é dividida em três componentes principais:

```text
Frontend
Backend
Banco de dados
```

e possui integração com um serviço externo:

```text
Ticketmaster Discovery API
```

A aplicação possui três perfis:

```text
CLIENT
ORGANIZER
GATE
```

Cada perfil possui permissões específicas controladas pelo backend.

---

# 2. Arquitetura geral

```text
                       Ticketmaster
                    Discovery API
                          │
                          ▼
┌────────────────┐   ┌──────────────────────┐
│                │   │                      │
│     Next.js    │──▶│       FastAPI        │
│     React      │   │      SQLAlchemy      │
│                │   │                      │
└────────────────┘   └──────────┬───────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │   PostgreSQL    │
                       │      Neon       │
                       │                 │
                       └─────────────────┘
```

Em produção:

```text
Frontend → Vercel
Backend  → Vercel
Database → Neon
```

---

# 3. Estrutura do repositório

```text
Plataforma-de-Eventos-e-Ingressos/
│
├── backend/
│   ├── api/
│   │   └── index.py
│   │
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── events.py
│   │   │   ├── external_events.py
│   │   │   ├── payments.py
│   │   │   ├── reservations.py
│   │   │   └── tickets.py
│   │   │
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   └── requirements.txt
│
└── frontend/
    ├── public/
    │
    └── src/
        ├── app/
        ├── components/
        ├── contexts/
        ├── lib/
        └── types/
```

---

# 4. Frontend

O frontend foi desenvolvido utilizando:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
```

A aplicação utiliza o App Router do Next.js.

Principais rotas:

```text
/cliente
/cliente/eventos
/cliente/eventos/[id]/reserva
/cliente/ingressos

/organizador
/organizador/events
/organizador/event-create
/organizador/importar-evento

/portaria

/login

/ingresso/[code]
```

---

# 5. Backend

O backend utiliza:

```text
Python
FastAPI
SQLAlchemy
Pydantic
PostgreSQL
```

Os principais grupos de endpoints são divididos em routers.

```text
/auth
/events
/external-events
/reservations
/payments
/tickets
```

---

# 6. Banco de dados

O banco utilizado é PostgreSQL.

Em desenvolvimento, pode ser utilizado um PostgreSQL local.

Em produção:

```text
Neon PostgreSQL
```

Principais tabelas:

```text
users
events
reservations
payments
tickets
```

---

# 7. Usuários

A entidade `User` concentra todos os perfis da plataforma.

Principais atributos:

```text
id
name
email
password_hash
role
created_at
```

O papel do usuário é armazenado no campo:

```text
role
```

Os valores são:

```text
CLIENT
ORGANIZER
GATE
```

---

# 8. Autenticação

A autenticação utiliza JWT.

Fluxo:

```text
Usuário
   │
   ▼
POST /auth/login
   │
   ▼
Verificação da senha
   │
   ▼
JWT
   │
   ▼
Frontend
```

Nas requisições protegidas:

```http
Authorization: Bearer <token>
```

O backend extrai do token as informações necessárias para identificar o usuário.

---

# 9. Senhas

As senhas não são armazenadas em texto puro.

O sistema utiliza:

```text
Argon2
```

através da biblioteca `pwdlib`.

O banco armazena:

```text
password_hash
```

e não a senha original.

---

# 10. Controle de acesso

O backend aplica autorização baseada em papéis.

## CLIENT

Pode executar operações como:

```text
criar reservas
consultar seus ingressos
realizar pagamentos
```

## ORGANIZER

Pode:

```text
criar eventos
consultar seus eventos
alterar seus eventos
sincronizar Ticketmaster
```

## GATE

Pode:

```text
validar ingressos
```

---

# 11. Eventos

A entidade `Event` representa os eventos da aplicação.

Campos principais:

```text
id
organizer_id
title
description
category
event_date
location
full_price
half_price
capacity
image_url
age_rating
status
```

Estados possíveis:

```text
DRAFT
PUBLISHED
CANCELLED
```

O catálogo do cliente consulta eventos:

```text
status = PUBLISHED
```

---

# 12. Categorias

O IngressoLivre utiliza as seguintes categorias:

```text
Teatro
Infantil & Família
Comédia
Esportes
Shows & Música
Festivais
Com desconto
Gastronomia
Evento Online
Cursos
Tecnologia
Games
Festas
Palestras
Feiras
Arte & Cultura
```

---

# 13. Ticketmaster Discovery API

## 13.1 Objetivo

A Ticketmaster funciona como fonte externa de dados.

Ela fornece informações sobre eventos reais que podem ser utilizados como base para o catálogo.

O IngressoLivre não utiliza a Ticketmaster para:

```text
reservas
pagamentos
tickets
validação
```

Essas operações continuam sob responsabilidade da aplicação.

---

# 14. Consulta externa

O backend utiliza HTTPX para consultar:

```text
Ticketmaster Discovery API
```

A API Key é armazenada exclusivamente no backend através de:

```env
TICKETMASTER_API_KEY=
```

Ela nunca é enviada ao frontend.

---

# 15. Normalização dos eventos externos

Os dados retornados pela Ticketmaster são convertidos para o modelo interno `Event`.

Exemplos de informações normalizadas:

```text
name        → title
date/time   → event_date
venue       → location
image       → image_url
price       → full_price / half_price
category    → category interna
```

Quando a Ticketmaster não fornece determinadas informações, a aplicação utiliza valores padrão definidos durante a sincronização.

---

# 16. Sincronização em massa

O endpoint:

```http
POST /external-events/sync-all
```

consulta múltiplas categorias.

Fluxo:

```text
Organizador
     │
     ▼
sync-all
     │
     ▼
Ticketmaster
     │
     ▼
Normalização
     │
     ▼
Event
     │
     ▼
PostgreSQL
```

A sincronização também realiza verificação para evitar a criação repetida do mesmo evento.

---

# 17. Catálogo

O frontend consulta eventos através de:

```http
GET /events
```

Filtros podem ser utilizados para:

```text
search
category
status
organizer
```

A página inicial utiliza apenas eventos publicados.

---

# 18. Reserva

A entidade `Reservation` relaciona:

```text
Client
Event
```

Principais dados:

```text
user_id
event_id
full_quantity
half_quantity
total
status
created_at
expires_at
```

---

# 19. Estados da reserva

Principais estados:

```text
PENDING
APPROVED
CANCELLED
EXPIRED
```

---

# 20. Controle de disponibilidade

A aplicação não utiliza assentos numerados.

O controle é baseado em:

```text
capacity
```

A disponibilidade é calculada considerando os ingressos já comprometidos.

Fluxo:

```text
capacidade
    -
reservas válidas
    =
disponibilidade
```

---

# 21. Concorrência na reserva

Durante a criação da reserva, o backend utiliza uma transação e bloqueia o registro do evento.

Exemplo:

```text
Cliente A             Cliente B
    │                     │
    ▼                     ▼
lock Event             aguarda
    │
verifica vagas
    │
cria reserva
    │
commit
                          │
                          ▼
                    verifica vagas
```

Isso reduz o risco de venda acima da capacidade disponível.

---

# 22. Pagamentos

O pagamento do projeto é simulado.

Endpoint principal:

```http
POST /payments/simulate
```

Possíveis resultados:

```text
APPROVED
REJECTED
```

---

# 23. Pagamento recusado

Quando o pagamento retorna:

```text
REJECTED
```

a tentativa é registrada.

A reserva permanece disponível para nova tentativa.

Nenhum ingresso é gerado.

---

# 24. Pagamento aprovado

Quando o resultado é:

```text
APPROVED
```

o backend:

```text
1. registra o pagamento;
2. aprova a reserva;
3. gera os ingressos;
4. associa os ingressos à reserva.
```

A lógica também impede que uma reserva aprovada gere ingressos duplicados.

---

# 25. Relacionamento de pagamentos

Uma reserva pode possuir múltiplas tentativas.

```text
Reservation
     │
     ├── Payment REJECTED
     ├── Payment REJECTED
     └── Payment APPROVED
```

Portanto:

```text
Reservation 1:N Payment
```

---

# 26. Ingressos

Cada ticket representa um ingresso individual.

Campos principais:

```text
id
reservation_id
ticket_type
price
code
status
validated_at
validated_by_id
```

---

# 27. Código do ingresso

Cada ingresso recebe um identificador UUID.

Esse identificador é utilizado para gerar o QR Code.

Formato lógico:

```text
ingressolivre:ticket:<UUID>
```

---

# 28. Propriedade do ingresso

O ingresso não necessita armazenar diretamente o usuário proprietário.

A relação é:

```text
Ticket
   │
   ▼
Reservation
   │
   ▼
User
```

Assim:

```text
Ticket → Reservation.user_id
```

determina o proprietário.

---

# 29. Área Meus ingressos

O cliente autenticado consulta:

```http
GET /tickets/me
```

O backend utiliza o JWT para identificar o usuário.

Assim, o cliente não envia manualmente:

```text
user_id
```

para obter seus ingressos.

---

# 30. Compartilhamento

Cada ingresso pode ser compartilhado através de:

```text
/ingresso/[code]
```

O compartilhamento não cria um novo ticket.

```text
Ticket original
      │
      ├── Cliente
      │
      └── Link compartilhado
```

Ambos representam o mesmo registro no PostgreSQL.

---

# 31. Validação pela portaria

A portaria utiliza:

```http
POST /tickets/validate
```

Dados principais:

```text
ticket code
event id
```

O usuário da portaria é identificado através do JWT.

---

# 32. Estados do ticket

Principais estados persistidos:

```text
VALID
USED
CANCELLED
```

A resposta da validação também pode informar:

```text
INVALID
WRONG_EVENT
```

---

# 33. Ticket válido

Para um ticket ser aceito:

```text
ticket existe
AND
status = VALID
AND
ticket pertence ao evento
```

Se todas as condições forem satisfeitas:

```text
VALID → USED
```

São registrados:

```text
validated_at
validated_by_id
```

---

# 34. Ticket usado

Se:

```text
status = USED
```

a entrada é recusada.

Isso impede reutilização.

---

# 35. Evento incorreto

Se o ingresso existir, mas sua reserva estiver relacionada a outro evento:

```text
WRONG_EVENT
```

---

# 36. Ticket inválido

Se o código não for encontrado:

```text
INVALID
```

---

# 37. Concorrência na portaria

A validação utiliza bloqueio do ticket.

Exemplo:

```text
Portaria A             Portaria B
    │                      │
    ▼                      ▼
lock Ticket              aguarda
    │
status VALID
    │
muda para USED
    │
commit
                           │
                           ▼
                     status USED
                           │
                           ▼
                      recusa entrada
```

Isso evita dupla validação simultânea.

---

# 38. CORS

O backend permite chamadas locais:

```text
http://localhost:3000
http://127.0.0.1:3000
```

Em produção, também utiliza:

```env
FRONTEND_URL=
```

Essa variável corresponde ao domínio do frontend hospedado.

---

# 39. Variáveis do backend

```env
DATABASE_URL=
JWT_SECRET=
TICKETMASTER_API_KEY=
FRONTEND_URL=
```

## DATABASE_URL

Connection string do PostgreSQL.

Produção:

```text
Neon PostgreSQL
```

---

## JWT_SECRET

Utilizada para assinatura dos tokens JWT.

Deve ser secreta e diferente entre ambientes.

---

## TICKETMASTER_API_KEY

Credencial utilizada para acessar a Ticketmaster Discovery API.

Nunca deve ser exposta no frontend.

---

## FRONTEND_URL

Origem permitida pelo CORS em produção.

---

# 40. Variável do frontend

```env
NEXT_PUBLIC_API_URL=
```

Em produção:

```text
https://ingressolivre-api.vercel.app
```

Essa variável é pública por definição, pois representa apenas a URL pública da API.

---

# 41. Endpoints — autenticação

```http
POST /auth/login
POST /auth/register
GET  /auth/me
```

---

# 42. Endpoints — eventos

```http
GET    /events
GET    /events/mine
GET    /events/{event_id}
POST   /events
PUT    /events/{event_id}
DELETE /events/{event_id}
```

---

# 43. Endpoints — Ticketmaster

```http
GET  /external-events
POST /external-events/sync-all
```

---

# 44. Endpoints — reservas

Principais operações:

```http
GET  /reservations/events/{event_id}/availability
POST /reservations
```

---

# 45. Endpoints — pagamentos

```http
POST /payments/simulate
```

---

# 46. Endpoints — ingressos

```http
GET  /tickets/me
GET  /tickets/{ticket_id}
GET  /tickets/share/{code}
POST /tickets/validate
```

Para a lista completa e os schemas:

https://ingressolivre-api.vercel.app/docs

---

# 47. Segurança

A aplicação utiliza:

```text
JWT
Argon2
roles
UUID
transações
row locking
CORS
environment variables
```

Medidas implementadas:

- senha armazenada como hash;
- endpoints protegidos por autenticação;
- autorização baseada em papéis;
- identificação do usuário pelo JWT;
- validação de propriedade da reserva;
- validação de propriedade do ingresso;
- API Key externa apenas no backend;
- bloqueio contra excesso de reservas;
- bloqueio contra dupla validação.

---

# 48. Infraestrutura de produção

## Frontend

```text
Next.js
Vercel

https://ingressolivre-eta.vercel.app/cliente
```

## Backend

```text
FastAPI
Vercel

https://ingressolivre-api.vercel.app
```

## Banco

```text
PostgreSQL
Neon
```

## Fonte externa

```text
Ticketmaster Discovery API
```

---

# 49. Fluxo geral do sistema

```text
                   TICKETMASTER
                       │
                       ▼
                  ORGANIZADOR
                       │
                       ▼
                  EVENTO LOCAL
                       │
                       ▼
                    CLIENTE
                       │
                       ▼
                    RESERVA
                       │
                       ▼
                   PAGAMENTO
                  /          \
            REJECTED       APPROVED
                              │
                              ▼
                           TICKET
                              │
                              ▼
                           QR CODE
                              │
                              ▼
                           PORTARIA
                              │
                              ▼
                            USED
```

---

# 50. Decisões de implementação

## Banco local como fonte de verdade

Mesmo eventos provenientes da Ticketmaster são armazenados no PostgreSQL.

Isso permite que toda operação transacional seja controlada pelo IngressoLivre.

---

## Ticketmaster apenas como fonte de conteúdo

A Ticketmaster não participa diretamente de:

```text
reserva
pagamento
ticket
validação
```

---

## Quantidade em vez de mapa de assentos

A plataforma trabalha com quantidade total e capacidade.

Essa decisão reduz a complexidade e mantém o controle de disponibilidade consistente.

---

## Pagamento simulado

O pagamento foi implementado como simulação para permitir testar explicitamente:

```text
aprovação
rejeição
nova tentativa
```

sem necessidade de integrar dados financeiros reais.

---

## UUID no QR Code

O ticket utiliza UUID em vez de IDs sequenciais públicos.

Isso reduz previsibilidade do código do ingresso.

---

## Identificação através do JWT

Operações autenticadas não dependem de IDs fixos no frontend.

Exemplo:

```text
não:
user_id = 2

sim:
Authorization → JWT → usuário atual
```

---

# 51. Execução local

## Backend

```bash
cd backend
python -m venv .venv
```

Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Dependências:

```bash
python -m pip install -r requirements.txt
```

Crie `.env`:

```env
DATABASE_URL=postgresql+psycopg://usuario:senha@localhost:5432/eventos_db
JWT_SECRET=sua-chave
TICKETMASTER_API_KEY=sua-chave
FRONTEND_URL=http://localhost:3000
```

Execute:

```bash
python -m uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend
npm install
```

Crie:

```text
.env.local
```

com:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Execute:

```bash
npm run dev
```

---

# 52. Build do frontend

Para validar a aplicação antes do deploy:

```bash
npm run build
```

O processo verifica:

```text
compilação
TypeScript
rotas
renderização
```

---

# 53. Deploy

A aplicação utiliza dois projetos separados na Vercel:

```text
ingressolivre
        ↓
frontend/

ingressolivre-api
        ↓
backend/
```

Ambos utilizam o mesmo repositório GitHub, mas possuem diretórios raiz diferentes.

---

# 54. Conclusão

O IngressoLivre implementa um fluxo completo de gestão de eventos:

```text
evento
  ↓
catálogo
  ↓
reserva
  ↓
pagamento
  ↓
ticket
  ↓
QR Code
  ↓
validação
```

A arquitetura mantém responsabilidades separadas entre:

```text
frontend
backend
persistência
integrações externas
```

permitindo que cada componente evolua de forma independente.
