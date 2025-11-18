# Nishiyama Canvas API

にしやまきゃんばす！のバックエンドAPIサーバー

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono (with RPC support)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Better Auth
- **Validation**: Zod
- **Testing**: Vitest
- **WebSocket**: Socket.io

## Directory Structure

```project-tree
apps/api/
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # Prisma schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed data
├── src/
│   ├── index.ts                  # Entry point (dotenv config)
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.instance.ts  # Better Auth instance
│   │   │   ├── auth.middleware.ts # Auth middleware
│   │   │   ├── auth.types.ts     # Auth types
│   │   │   ├── index.ts          # Module exports
│   │   │   └── __tests__/        # Auth tests
│   │   └── signage/              # Signage module
│   │       ├── signage.routes.ts     # Route handlers
│   │       ├── signage.service.ts    # Business logic
│   │       ├── signage.repository.ts # Data access
│   │       ├── index.ts              # Module exports
│   │       └── __tests__/            # Signage tests
│   ├── lib/                      # Shared libraries
│   │   ├── db.ts                 # Prisma client
│   │   ├── constants.ts          # Constants
│   │   ├── auth/                 # Auth configuration
│   │   │   └── config.ts
│   │   └── utils/                # Utilities
│   │       └── http-errors.ts
│   ├── types/                    # Type definitions
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── signage.ts
│   │   └── validation/           # Zod schemas
│   │       ├── index.ts
│   │       └── signage.schema.ts
│   └── test/                     # Test setup
│       └── setup.ts              # Vitest config (dotenv)
├── vitest.config.ts              # Vitest configuration
├── tsconfig.json                 # TypeScript config
├── package.json
├── .env.example                  # Environment variables template
└── .env.test                     # Test environment variables
```

## Architecture

### Layered Architecture

```
Routes (Presentation)
  ↓
Services (Business Logic)
  ↓
Repositories (Data Access)
  ↓
Database (Prisma)
```

### Module Structure

各機能は `modules/` 配下にモジュールとして整理されています:

- **auth/**: 認証・認可機能
- **signage/**: サイネージCRUD操作
- **news/**: ニュース管理 (予定)
- **animals/**: 動物データ管理 (予定)
- **admin/**: 管理者機能 (予定)

各モジュールは以下のファイルで構成:

- `*.routes.ts`: HTTPリクエスト処理、バリデーション
- `*.service.ts`: ビジネスロジック、トランザクション管理
- `*.repository.ts`: データアクセスロジック (Prisma)
- `*.types.ts`: モジュール固有の型定義
- `index.ts`: モジュールのエクスポート
- `__tests__/`: モジュールのテスト

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:migrate        # Run migrations
pnpm db:push           # Push schema (dev only)

# Generate Prisma client
pnpm prisma generate

# Create .env.local and .env.test
cp .env.example .env.local
cp .env.example .env.test
```

### Environment Variables

- **Development**: `.env.local` (loaded by dotenv in src/index.ts)
- **Testing**: `.env.test` (loaded by dotenv in src/test/setup.ts)
- **Production**: Set environment variables directly (no .env file)

Required variables (see `.env.example`):

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:8000
```

### Running

```bash
# Development mode
pnpm dev              # Start dev server (http://localhost:8000)

# Production build
pnpm build
pnpm start
```

### Testing (TDD)

```bash
# Run all tests
pnpm test

# Watch mode (recommended for TDD)
pnpm test:watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

### Database

```bash
# Create migration
pnpm prisma migrate dev --name <migration_name>

# Apply migrations (production)
pnpm prisma migrate deploy

# Reset database (dev only - deletes all data!)
pnpm prisma migrate reset

# Seed database
pnpm prisma db seed

# Open Prisma Studio
pnpm prisma studio    # http://localhost:5555
```

### Code Quality

```bash
# Lint & format check
pnpm check

# Lint & format fix
pnpm check:fix

# Type check
pnpm type-check
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-in/social` - Social login (Google, Discord, LINE)
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### Signages

- `GET /api/signages` - List user's signages
- `POST /api/signages` - Create signage (1 per user limit)
- `GET /api/signages/:id` - Get signage details
- `PATCH /api/signages/:id` - Update signage
- `DELETE /api/signages/:id` - Delete signage
- `POST /api/signages/:id/publish` - Publish signage

### WebSocket

- `content_updated` - Content update notification
- `news_added` - New news notification
- `image_added` - New image notification

## Type Safety

### Hono RPC

バックエンドから `AppType` をエクスポートし、フロントエンドで型安全にAPI通信:

```typescript
// src/index.ts
const app = new Hono()
  .route('/api/signages', signageRoutes)
  // ... other routes

export type AppType = typeof app
export default app
```

フロントエンド側:

```typescript
import { hc } from 'hono/client'
import type { AppType } from '@/apps/api/src'

const client = hc<AppType>('http://localhost:8000')
const response = await client.api.signages.$get()
// 型安全!
```

## Testing Guidelines

### TDD Workflow

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('SignageService', () => {
  describe('createSignage', () => {
    it('should create signage successfully', async () => {
      // Arrange
      const input = { ... }

      // Act
      const result = await service.createSignage(input)

      // Assert
      expect(result).toMatchObject({ ... })
    })

    it('should throw error when user already has signage', async () => {
      // ...
    })
  })
})
```

### Test Categories

- **Unit Tests**: Service, Repository層の単体テスト
- **Integration Tests**: Route層の統合テスト (HTTP requests)
- **E2E Tests**: フロントエンドから実施

## Coding Standards

### TypeScript Rules

- **No `any` or `unknown`**: すべての変数・関数に明示的な型定義
- **No `class`**: 関数型スタイル採用 (例外: `Error`クラスの拡張のみ)
- **Explicit return types**: すべての関数に戻り値の型を定義

```typescript
// ❌ Bad
function getUser(id: any) { ... }
class UserService { ... }

// ✅ Good
interface User { id: string; name: string }
function getUser(id: string): Promise<User> { ... }

type UserService = { getUser: (id: string) => Promise<User> }
const createUserService = (repo: UserRepository): UserService => ({ ... })
```

### Error Handling

カスタムエラークラスを使用:

```typescript
import { createHttpError } from '@/lib/utils/http-errors'

// Usage
throw createHttpError(404, 'Signage not found')
throw createHttpError(403, 'Access denied')
```

## Documentation

- `docs/api-specification.md`: API仕様書
- `docs/database-schema.md`: データベーススキーマ
- `docs/architecture.md`: アーキテクチャ設計
- `docs/tdd-guidelines.md`: TDD開発ガイドライン

## References

- [Hono](https://hono.dev/)
- [Prisma](https://www.prisma.io/)
- [Better Auth](https://www.better-auth.com/)
- [Vitest](https://vitest.dev/)
