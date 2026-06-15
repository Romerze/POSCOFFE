# Guía de desarrollo — POSCOFFE

Monorepo gestionado con **pnpm + Turborepo**.

## Requisitos

- Node.js ≥ 20 (probado en 22)
- pnpm 11 (`corepack enable` o `npm i -g pnpm`)
- Docker (para PostgreSQL + Redis)

## Estructura

```
packages/types     Contratos TS compartidos (roles, enums, auth)
server             API NestJS + Prisma (REST + WebSockets)
apps/pos           App de caja (React + Vite, PWA offline-first)
```

## Puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
cp .env.example server/.env   # Prisma lee server/.env

# 3. Levantar base de datos y Redis
pnpm infra:up

# 4. Compilar tipos y generar cliente Prisma
pnpm --filter @poscoffe/types build
pnpm db:generate

# 5. Aplicar migraciones y datos de ejemplo
pnpm db:migrate      # o: pnpm --filter @poscoffe/server exec prisma migrate deploy
pnpm db:seed

# 6. Arrancar en desarrollo (API + POS)
pnpm dev
```

- API: http://localhost:3000/api/v1 (health en `/health`)
- POS: http://localhost:5173

## Usuarios demo (tras el seed)

| Rol | Email | Password | PIN |
|-----|-------|----------|-----|
| Dueño (multi-local) | dueno@poscoffe.dev | poscoffe123 | 1234 |
| Cajero | cajero@poscoffe.dev | poscoffe123 | 1234 |
| Barista | barista@poscoffe.dev | poscoffe123 | 1234 |

## Scripts útiles

```bash
pnpm build        # build de todo el monorepo (turbo)
pnpm test         # tests
pnpm typecheck    # typecheck
pnpm infra:down   # detener postgres/redis
```

## Notas

- El esquema de datos vive en `server/prisma/schema.prisma` (ver [docs/07](docs/07-modelo-datos.md)).
- La migración inicial está en `server/prisma/migrations/0001_init`.
- Decisiones de arquitectura: [docs/06](docs/06-arquitectura.md).
