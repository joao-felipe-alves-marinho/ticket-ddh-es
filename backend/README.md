# Ticket Manager System - Backend

A modern, event-sourced ticket management system built with **NestJS**, **Domain-Driven Design (DDD)**, **Event Sourcing**, and **CQRS** patterns.

## 🎯 Project Overview

This backend service implements a scalable, distributed ticket management system using:

- **Event Sourcing**: All state changes are captured as immutable events in KurrentDB
- **CQRS (Command Query Responsibility Segregation)**: Separate write and read models
- **Hexagonal Architecture**: Clean separation between domain logic and infrastructure concerns
- **Domain-Driven Design**: Rich domain models with aggregate roots and value objects

The system maintains a **write model** in KurrentDB (Event Store) and a **read model** in MongoDB (projections), ensuring optimal performance for both writes and reads.

---

## 🏗️ Architecture

### Layers

```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/          # Business rules, entities, ports (interfaces)
│   │   ├── application/     # Use cases, command & query handlers
│   │   └── infrastructure/  # Implementations, HTTP controllers, DB adapters
│   ├── ticket/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── ...
└── shared/
    ├── domain/              # DDD base classes, aggregate roots
    ├── infrastructure/      # KurrentDB, MongoDB, HTTP error DTOs
    └── config/              # Application configuration
```

### Patterns

#### Domain-Driven Design (DDD)
- **Aggregate Roots**: `UserEntity`, `TicketEntity` — manage consistency boundaries
- **Value Objects**: `Email`, `Password`, `Role` — encapsulate domain concepts
- **Domain Events**: `UserRegisteredEvent`, `TicketCreatedEvent` — represent state changes
- **Repositories**: Ports define contracts; implementations adapt to storage

#### Event Sourcing
- All state changes are captured as immutable events
- Aggregate roots replay events from history to rebuild state
- Event Store (KurrentDB) is the single source of truth for writes

#### CQRS
- **Write Side (Commands)**: Update event store via command handlers
- **Read Side (Projections)**: Async projections populate MongoDB read model
- Projectors subscribe to category streams (`$ce-user`, `$ce-ticket`) and upsert read documents

#### Hexagonal Architecture
- **Domain Layer**: Pure TypeScript, no framework dependencies, no I/O
- **Ports (Interfaces)**: Define boundaries (e.g., `UserWriteRepositoryPort`, `UserReadRepositoryPort`)
- **Adapters (Implementations)**: HTTP controllers, repository implementations, event mappers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [NestJS](https://nestjs.com/) (Node.js, TypeScript) |
| **Event Store** | [KurrentDB](https://kurrentdb.com/) (Event Store DB) |
| **Read Model DB** | [MongoDB](https://www.mongodb.com/) with Mongoose |
| **Authentication** | JWT + Passport.js + bcrypt |
| **Validation** | class-validator, class-transformer |
| **Documentation** | Swagger/OpenAPI |
| **DI & CQRS** | @nestjs/cqrs, @nestjs/common |
| **Runtime** | Node.js 22 (Bookworm) |
| **Container** | Docker + docker-compose |

---

## 📦 Project Structure

```
backend/
├── src/
│   ├── app.module.ts              # Root application module
│   ├── main.ts                    # Application entry point
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── domain/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── events/
│   │   │   │   ├── ports/
│   │   │   │   └── value-objects/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   ├── queries/
│   │   │   │   └── dtos/
│   │   │   └── infrastructure/
│   │   │       ├── http/
│   │   │       ├── jwt/
│   │   │       ├── kurrentdb/
│   │   │       ├── mongodb/
│   │   │       └── projections/
│   │   └── ticket/                # Ticket module (similar structure)
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   └── shared/
│       ├── domain/                # DDD base classes
│       │   ├── aggregate-root.base.ts
│       │   ├── entity.base.ts
│       │   ├── value-object.base.ts
│       │   └── domain-event.base.ts
│       ├── infrastructure/
│       │   ├── kurrentdb/         # Event Store integration
│       │   ├── mongodb/
│       │   ├── projections/       # CQRS projectors
│       │   ├── decorators/
│       │   ├── guards/
│       │   └── http/
│       ├── config/
│       ├── common/
│       │   ├── exceptions/
│       │   ├── utils/
│       │   └── result.ts
│       └── index.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md (this file)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20+ (v22 recommended)
- **Yarn**: v3.6+
- **Docker**: v24+ (for containerized setup)
- **Docker Compose**: v2+

Or use Docker entirely—no local Node/Yarn needed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ticket-ddd-es/backend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000

   # Database (Event Store)
   KURRENTDB_CONNECTION_STRING=kurrentdb://admin:changeit@localhost:2113?tls=false

   # Database (Read Model)
   MONGODB_URI=mongodb://mongo:27017/ticket-ddd-es

   # JWT
   JWT_SECRET=your-secret-key-here-change-in-production
   JWT_EXPIRES_IN=24h
   ```

### Running Locally

#### With Docker Compose (Recommended)

```bash
# Start all services (KurrentDB, MongoDB, backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

Backend will be available at `http://localhost:3000`.

#### Without Docker (Manual Setup)

Ensure KurrentDB and MongoDB are running separately, then:

```bash
# Development mode (with auto-reload)
yarn start:dev

# Production build
yarn build
yarn start:prod
```

---

## 📖 API Documentation

### Swagger UI

Once the app is running, visit:
```
http://localhost:3000/api/v1/docs
```

### Available Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /register` — Register a new user
  - Body: `{ email, name, password, role }`
  - Returns: `{ id }`
- `POST /login` — Authenticate user and get JWT token
  - Body: `{ email, password }`
  - Returns: `{ token, userId, email, name, role }`

#### Tickets (`/api/v1/tickets`)
- `POST /` — Create a new ticket
- `GET /:id` — Retrieve ticket by ID
- `GET /` — Get all tickets (paginated)
- `GET /search` — Search tickets
- `POST /:id/triage` — Triage a ticket
- `POST /:id/start-progress` — Start progress on a ticket
- `POST /:id/block` — Block a ticket
- `POST /:id/resolve` — Resolve a ticket
- `POST /:id/reopen` — Reopen a ticket
- `POST /:id/cancel` — Cancel a ticket
- `POST /:id/assign` — Assign a ticket to a user
- `PATCH /:id/update-details` — Update ticket details

---

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for stateless authentication:

1. **Register** a user (`POST /auth/register`)
2. **Login** to get a JWT token (`POST /auth/login`)
3. **Use token** in subsequent requests via `Authorization: Bearer <token>` header

Passwords are hashed with **bcrypt** (salt rounds: 10) and never stored in plaintext.

---

## 📊 Event Store & Read Model

### Write Model (KurrentDB)
- Events are appended to **individual streams** named `user-<id>`, `ticket-<id>`, etc.
- Aggregates rebuild state by replaying events
- **Metadata**: Each event includes `aggregateId` and `occurredAt` timestamp

### Read Model (MongoDB)
- **Projectors** subscribe to **category streams** (`$ce-user`, `$ce-ticket`)
- When an event is published, the projector receives it and updates the MongoDB collection
- Collections: `users`, `tickets`
- Queries use MongoDB for fast reads

---

## 🧪 Testing

**Note**: Tests are not yet implemented. Unit and integration tests are planned for future releases.

To run tests (when available):
```bash
yarn test           # Unit tests
yarn test:e2e       # End-to-end tests
yarn test:cov       # Coverage report
```

---

## 🔧 Development Workflow

### Creating a New Use Case (Command)

1. **Define Domain Event** (`src/modules/[module]/domain/events/`)
   ```typescript
   export class UserRegisteredEvent extends DomainEvent {
     readonly eventName = 'UserRegistered';
     constructor(public readonly props: { email: string }) {
       super();
     }
   }
   ```

2. **Create Command** (`src/modules/[module]/application/commands/`)
   ```typescript
   export class RegisterUserCommand {
     constructor(public readonly email: string) {}
   }
   ```

3. **Implement Command Handler** (`src/modules/[module]/application/commands/`)
   ```typescript
   @CommandHandler(RegisterUserCommand)
   export class RegisterUserCommandHandler implements ICommandHandler {
     constructor(
       @Inject(UserWriteRepositoryToken)
       private readonly repo: UserWriteRepositoryPort,
     ) {}

     async execute(command: RegisterUserCommand): Promise<Result<AggregateID>> {
       const user = UserEntity.create({ email: command.email });
       return this.repo.save(user);
     }
   }
   ```

4. **Add Projector** (`src/modules/[module]/infrastructure/projections/`)
   ```typescript
   export class UserProjector extends BaseProjector<UserDocument> {
     protected streamName = '$ce-user';
     // Inherits subscription and event handling
   }
   ```

5. **Wire in Module** (`src/modules/[module]/[module].module.ts`)
   ```typescript
   providers: [
     RegisterUserCommandHandler,
     UserProjector,
     // ... other providers
   ]
   ```

### Modifying the Domain Model

- **Domain layer** (`domain/`) — Pure TypeScript, no framework imports
- **Application layer** (`application/`) — Business logic, validators, DTOs
- **Infrastructure layer** (`infrastructure/`) — I/O, HTTP, DB, adapters

**Golden Rule**: Never import from `infrastructure/` into `domain/`. Use ports (interfaces).

---

## 🐛 Known Issues & Limitations

### Current Status
- ✅ Auth module: Register and login with JWT authentication
- ✅ Ticket module: CRUD and state transitions via commands
- ✅ Event sourcing: Events are appended to KurrentDB
- ✅ Projections: Read model is populated from event stream
- ⚠️ **Issue**: Projections subscription may not receive events immediately; ensure category streams are being written to
- ❌ Tests: Not yet implemented
- ❌ Frontend: Not included in this package

### Debugging

If projections are not working:
1. Check backend logs: `docker-compose logs -f backend`
2. Verify MongoDB collections: `docker exec backend-mongo-1 mongosh --quiet --eval "db.users.countDocuments()"`
3. Ensure KurrentDB is running: `docker-compose ps`
4. Check event append logs in KurrentDB

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `KURRENTDB_CONNECTION_STRING` | `kurrentdb://admin:changeit@localhost:2113?tls=false` | Event Store connection |
| `MONGODB_URI` | `mongodb://mongo:27017/ticket-ddd-es` | Read Model database |
| `JWT_SECRET` | (required) | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `24h` | JWT token expiration |

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Domain-Driven Design](https://dddcommunity.org/)
- [KurrentDB/EventStoreDB Documentation](https://developers.eventstore.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

## 🚧 Future Enhancements

- [ ] Unit and integration tests
- [ ] Advanced search and filtering
- [ ] Activity audit logs
- [ ] Real-time notifications (WebSockets)
- [ ] Performance optimizations (caching, indexing)
- [ ] API rate limiting
- [ ] Multi-tenancy support
- [ ] Comprehensive error recovery
- [ ] Event versioning and migrations

---

## 📄 License

This project is part of the PH-203 curriculum. See `LICENSE` for details.

---

## 👨‍💻 Contributing

1. Follow the existing architecture patterns (DDD, Hexagonal)
2. Keep domain logic pure (no framework or I/O in `domain/`)
3. Write clear commit messages (use Conventional Commits)
4. Update this README for significant changes

---

**Last Updated**: May 2, 2026  
**Status**: In active development
