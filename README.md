# Appointments API

SDET Noe MArtinez - API to manage vehicle service appointments.

## Architecture

One Lambda behind API Gateway, PostgreSQL as database. Runs locally with Docker (Floci for AWS + Postgres).

```
Client -> API Gateway -> Lambda -> PostgreSQL
```

Hexagonal structure:

- `src/handler.ts` - lambda entry, routes
- `src/application/appointment-service.ts` - use cases
- `src/domain/` - appointment types, validations and repository port
- `src/infrastructure/postgres-appointment-repository.ts` - postgres adapter
- `database/` - schema and seed

## Run

Needs Node, Docker and Serverless v4 (`serverless login`).

```
npm install
docker compose up -d
npm run deploy
```

Deploy prints the API url (`http://localhost:4566/restapis/<id>/local/_user_request_`). Postgres is created and seeded on first start.

## Endpoints

- `GET /appointments?date=YYYY-MM-DD` - list appointments by date
- `POST /customers/{customerId}/appointments` - create appointment
  - body: `{ "vehicleId": 1, "date": "2026-12-03", "time": "11:00", "comments": "..." }`
- `PATCH /appointments/{appointmentId}` - change date
  - body: `{ "date": "2026-12-05", "time": "16:00" }` (time is optional)
- `PATCH /appointments/{appointmentId}/cancel` - cancel appointment (status DISABLED)

Errors: 400 invalid data, 404 not found, 409 slot taken or already cancelled.