# ticket-ddh-es

A modern, event-sourced ticket management system demonstrating Domain-Driven Hexagon (DDH), Event Sourcing, and CQRS patterns with NestJS.

## Overview

`ticket-ddh-es` is a backend reference implementation showcasing clean architecture principles and advanced patterns for building scalable, maintainable distributed systems. It serves as both a working application and an educational resource for applying DDD and event-driven architecture.

**Key Features:**
- Event Sourcing with KurrentDB as the event store
- CQRS pattern with separated read and write models
- Hexagonal (ports & adapters) architecture
- Domain-Driven Design with rich domain models
- JWT-based authentication
- MongoDB for read-model projections
- Docker support for local development

## Project Structure

```
ticket-ddh-es/
├── backend/                 # NestJS application (main focus)
│   ├── src/
│   │   ├── modules/         # Feature modules (auth, ticket, etc.)
│   │   │   ├── domain/      # Business logic, entities, ports
│   │   │   ├── application/ # Use cases, command/query handlers
│   │   │   └── infrastructure/
│   │   └── shared/          # Common DDD bases, infrastructure utilities
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
└── frontend/                # Work in progress (coming later)
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Docker & Docker Compose (optional, recommended for full stack)

### Local Development

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Start in development mode:**
```bash
npm run start:dev
```

The backend will be available at `http://localhost:3000`.

### Docker

Run the full stack with Docker Compose:

```bash
docker-compose up --build
```

## Architecture Highlights

### Domain-Driven Design
- **Aggregates**: `UserEntity`, `TicketEntity` enforce consistency boundaries
- **Value Objects**: Encapsulate domain concepts like `Email`, `Password`, `Role`
- **Domain Events**: Immutable records of state changes (`UserRegisteredEvent`, `TicketCreatedEvent`, etc.)
- **Repositories**: Port-based abstractions for data access

### Event Sourcing
- All state mutations are captured as immutable events in KurrentDB
- Aggregate roots rebuild state by replaying events from history
- Event store is the single source of truth for writes

### CQRS
- **Write Side**: Commands update the event store via handlers
- **Read Side**: Async projectors subscribe to event streams and populate MongoDB
- Optimized independently for write and read workloads

### Hexagonal Architecture
- **Domain Layer**: Pure TypeScript, framework-agnostic, no I/O
- **Ports (Interfaces)**: Define boundaries (e.g., `UserWriteRepositoryPort`)
- **Adapters (Infrastructure)**: KurrentDB, MongoDB, HTTP, JWT implementations

## License

MIT

