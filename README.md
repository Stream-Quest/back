# StreamQuest — Backend

> A self-hosted TTRPG event engine powered by Twitch

StreamQuest bridges your Twitch stream and your tabletop roleplaying game sessions. When viewers subscribe, cheer, or raid, StreamQuest creates narrative events for your GM to validate — giving your audience real agency in your story.

---

## Documentation

Full documentation: **https://weavecast.github.io/stream-quest-docs**

API reference (Swagger): `http://localhost:3999/api/docs` _(once running)_

---

## Quick Start

```bash
git clone https://github.com/WeaveCast/stream-quest-docs
cd stream-quest-docs
cp .env.example .env
# Edit .env with your Twitch credentials
make install
```

See the [Installation guide](https://weavecast.github.io/stream-quest-docs/docs/getting-started/installation) for full instructions.

---

## Tech Stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Backend         | NestJS (TypeScript)     |
| Database        | PostgreSQL 16           |
| ORM             | Prisma 7                |
| Cache / Pub-Sub | Redis 7                 |
| Real-time       | Socket.io               |
| Auth            | Twitch OAuth + JWT      |
| Infrastructure  | Docker + Docker Compose |

---

## Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

```bash
git clone https://github.com/WeaveCast/stream-quest-back
cd stream-quest-back
npm install
cp .env.example .env
# Edit .env with your credentials

# Start PostgreSQL and Redis
docker compose -f docker-compose.dev.yml up -d

# Run migrations
npx prisma migrate dev

# Start dev server
npm run start:dev
```

### Commands

```bash
npm run start:dev     # Start development server (watch mode)
npm run build         # Build for production
npm run lint          # Lint and auto-fix
npm run test          # Run unit tests
npm run test:cov      # Run tests with coverage report
```

### Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) or the [full architecture guide](https://weavecast.github.io/stream-quest-docs/docs/development/architecture).

---

## Status

| Module                  | Status | Coverage |
| ----------------------- | ------ | -------- |
| AuthModule              | ✅     | ~91%     |
| CampaignModule          | ✅     | ~99%     |
| CampaignEventModule     | ✅     | 100%     |
| SessionModule           | ✅     | ~99%     |
| SessionEventModule      | ✅     | ~95%     |
| EventModule             | ✅     | 100%     |
| EventTypeModule         | ✅     | 100%     |
| KarmaModule             | ✅     | ~98%     |
| ThresholdEventModule    | ✅     | 100%     |
| TwitchModule            | ✅     | ~70%     |
| TwitchMappingModule     | ✅     | ~91%     |
| PlayerCharacterModule   | ✅     | 100%     |
| LocationModule          | ✅     | 100%     |
| WeatherModule           | ✅     | 100%     |
| Frontend (GM Dashboard) | 🚧     | —        |
| Frontend (OBS Overlay)  | 🚧     | —        |

**506 tests — 90%+ coverage**

---

## Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) or the [contributing guide](https://weavecast.github.io/stream-quest-docs/docs/development/contributing).

---

## License

[MIT](./LICENSE) © WeaveCast
