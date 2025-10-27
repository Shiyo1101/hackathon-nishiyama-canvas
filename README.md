# にしやまきゃんばす！ (Nishiyama Canvas!)

福井県鯖江市「西山動物園」のレッサーパンダをテーマにしたデジタルサイネージ作成・管理アプリケーション

## 📋 プロジェクト概要

ユーザーは動物園から提供されるニュースやレッサーパンダの写真（オープンデータ）を活用して、独自のデジタルサイネージページを作成・公開できます。

### 主な機能

- **サイネージ作成**: ドラッグ&ドロップで簡単にレイアウト作成
- **1ユーザー1サイネージ**: 無料プランでは各ユーザーは1つのサイネージのみ作成可能
- **リアルタイム更新**: WebSocketによる自動コンテンツ更新
- **公開/非公開設定**: サイネージの公開状態を管理
- **通報機能**: 不適切なコンテンツを事後通報

## 🛠 技術スタック

### フロントエンド (apps/web)

- **Next.js 15** (App Router)
- **TypeScript 5+**
- **Tailwind CSS** + shadcn/ui
- **Jotai** (状態管理)
- **Hono RPC Client** (型安全なAPI通信)
- **@dnd-kit** (ドラッグ&ドロップ)
- **Socket.io-client** (WebSocket)

### バックエンド (apps/api)

- **Hono** (APIフレームワーク with RPC support)
- **TypeScript 5+**
- **Prisma** (ORM)
- **Better Auth** (認証)
- **Socket.io** (WebSocket)
- **Zod** (バリデーション)
- **dotenv** (環境変数管理)
- **Vitest** (テストフレームワーク)

### データベース

- **PostgreSQL 15+**
- **Prisma** (統合: `apps/api/prisma/`)

### 開発ツール

- **pnpm** (パッケージマネージャー)
- **Turbo** (モノレポビルドシステム)
- **Biome** (リンター・フォーマッター)
- **Docker Compose** (PostgreSQL環境)

## 📁 プロジェクト構成 (Monorepo)

```project-tree
nishiyama-canvas/
├── apps/
│   ├── api/              # Hono バックエンド + Prisma
│   │   ├── prisma/       # データベーススキーマ・マイグレーション
│   │   └── src/
│   │       ├── lib/db.ts # Prisma クライアント
│   │       ├── types/    # API 型定義
│   │       └── test/     # テストセットアップ
│   └── web/              # Next.js フロントエンド
│       └── src/
│           └── types/    # Web 型定義
├── docs/                 # 設計ドキュメント
├── .github/              # GitHub Actions CI/CD
├── docker-compose.yml    # PostgreSQL Docker設定
├── pnpm-workspace.yaml   # pnpm ワークスペース設定
├── turbo.json            # Turbo ビルド設定
└── package.json          # ワークスペースルート
```

## 🚀 セットアップ

### 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: v18.0+ ([インストール](https://nodejs.org/))
- **pnpm**: v8.0+ ([インストール](https://pnpm.io/installation))
- **Docker** & **Docker Compose**: 最新版 ([インストール](https://docs.docker.com/get-docker/))
- **Git**: v2.0+

> **Note**: PostgreSQLはDocker Composeで自動的にセットアップされます。ローカルインストールは不要です。

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/nishiyama-canvas.git
cd nishiyama-canvas
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
# バックエンド用の環境変数
cp apps/api/.env.example apps/api/.env.local

# テスト環境用の環境変数（テスト専用DB使用）
cp apps/api/.env.example apps/api/.env.test

# フロントエンド用の環境変数
cp apps/web/.env.example apps/web/.env.local
```

`.env.local`と`.env.test`ファイルを編集して、データベース接続情報などを設定してください。

**環境変数の管理**:

- **開発環境**: `.env.local` (優先度: `.env.local` > `.env`)
- **テスト環境**: `.env.test` (テスト実行時に自動読み込み)
- **本番環境**: 環境変数を直接設定（`.env`ファイルは使用しない）

### 4. データベースのセットアップ（Docker Compose）

```bash
# PostgreSQLコンテナを起動
docker compose up -d

# コンテナが起動するまで少し待つ（初回は10秒程度）
# ヘルスチェックが通るのを確認
docker compose ps

# データベースマイグレーションの実行
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev --name init

# シードデータの投入（開発用のサンプルデータ）
pnpm prisma db seed

# テスト専用データベースのセットアップ（推奨）
# まず、テスト用DBを作成
docker compose exec postgres psql -U nishiyama_user -d postgres -c "CREATE DATABASE nishiyama_canvas_test;"

# テスト用DBにマイグレーションを適用
DATABASE_URL="postgresql://nishiyama_user:nishiyama_password@localhost:5432/nishiyama_canvas_test" pnpm prisma migrate deploy
```

**Docker Compose設定内容:**

- PostgreSQL 15（Alpine Linux）
- 開発用DB: `nishiyama_canvas_dev`
- テスト用DB: `nishiyama_canvas_test`（手動作成）
- ユーザー名: `nishiyama_user`
- パスワード: `nishiyama_password`
- ポート: `5432`
- データ永続化: Dockerボリューム使用

### 5. Better Auth（認証）の設定

このプロジェクトでは、認証に**Better Auth**を使用しています。

**重要**: メール・パスワード認証は廃止し、**ソーシャルログイン（Google、Discord、LINE）のみ**を採用しています。

```bash
# AUTH_SECRETを生成（32文字以上のランダムな文字列）
# apps/api/.env.local に設定してください

# ソーシャルログイン設定（すべて必須）
# Google, Discord, LINEの開発者コンソールでOAuthアプリを作成し、
# クライアントIDとシークレットを .env.local に設定
```

詳細は[Better Authセットアップガイド](./docs/better-auth-setup.md)を参照してください。

### 6. 開発サーバーの起動

```bash
# ルートディレクトリで全てのアプリケーションを起動
pnpm dev

# または個別に起動
pnpm dev:api    # バックエンドのみ (http://localhost:8000)
pnpm dev:web    # フロントエンドのみ (http://localhost:3000)
```

## 📝 開発コマンド

### 全般

```bash
pnpm dev              # 全アプリケーション起動（Turbo使用）
pnpm build            # 全アプリケーションビルド（Turbo使用）
pnpm test             # テスト実行
pnpm test:watch       # テストウォッチモード
pnpm test:coverage    # カバレッジ取得
pnpm test:ui          # Vitest UIモード
pnpm type-check       # 型チェック
pnpm check            # Biomeチェック
pnpm check:fix        # Biome自動修正
```

### データベース操作

```bash
pnpm db:migrate       # マイグレーション実行
pnpm db:push          # スキーマをDBに反映（開発用）
pnpm db:studio        # Prisma Studio起動 (http://localhost:5555)
pnpm db:seed          # シードデータ投入

# 特定のアプリのみ実行
pnpm --filter=api test           # APIのテストのみ
pnpm --filter=api db:migrate     # APIのマイグレーションのみ
```

## 📚 ドキュメント

プロジェクトの詳細なドキュメントは`docs/`ディレクトリにあります：

- [要件定義書](./docs/requirements.md)
- [アーキテクチャ設計書](./docs/architecture.md)
- [データベーススキーマ設計書](./docs/database-schema.md)
- [API仕様書](./docs/api-specification.md)
- [開発ガイドライン](./docs/development-guidelines.md)
- [TDD開発ガイドライン](./docs/tdd-guidelines.md)
- [セットアップガイド](./docs/setup-guide.md)
- [実装タスクリスト](./docs/implementation-tasks.md)

## 🎯 開発の進め方

### 1. タスク確認

`docs/implementation-tasks.md`で次に取り組むタスクを確認します。

### 2. ブランチ作成

```bash
git checkout -b feature/123-feature-name
```

### 3. TDDサイクル

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善

### 4. コード品質チェック

```bash
pnpm check:fix && pnpm type-check && pnpm test
```

### 5. タスク完了マーク

`docs/implementation-tasks.md`で該当タスクを`- [x]`に変更します。

### 6. コミット

```bash
git add .
git commit -m "feat(scope): description"
```

コミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/)形式に従ってください。

## 📐 コーディング規約

### TypeScript

- **`any`、`unknown`の使用禁止**: すべての変数・関数に明示的な型定義
- **クラス使用禁止**: 関数型プログラミングスタイル採用（例外: `Error`クラスの拡張のみ許可）
- **ハードコード禁止**: マジックナンバーは定数化

### 良い例 ✅

```typescript
interface Data { value: string; }
function processData(data: Data): string { ... }

type UserService = { getUser: (id: string) => Promise<User>; };
const createUserService = (repository: UserRepository): UserService => ({ ... });
```

### 悪い例 ❌

```typescript
function processData(data: any) { ... }
class UserService { ... }
```

## 🧪 テスト

このプロジェクトでは**Vitest**を使用しています。

### ユニットテスト

```bash
pnpm test              # 全テスト実行
pnpm test:watch        # ウォッチモード（TDD推奨）
pnpm test:coverage     # カバレッジ取得
pnpm test:ui           # Vitest UIモード

# 特定のアプリのみ
pnpm --filter=api test
```

**テスト環境の特徴**:

- テスト専用データベース（`nishiyama_canvas_test`）を使用
- `.env.test`から環境変数を自動読み込み
- 39テスト全て合格確認済み ✅

### E2Eテスト

```bash
cd apps/web
pnpm test:e2e
pnpm test:e2e:ui
```

## 🔧 トラブルシューティング

### Dockerコンテナの管理

```bash
# コンテナの状態確認
docker compose ps

# コンテナのログ確認
docker compose logs postgres
docker compose logs -f postgres  # リアルタイムで表示

# コンテナの再起動
docker compose restart postgres

# コンテナの停止
docker compose down

# コンテナとボリュームを完全削除（データも削除されます！）
docker compose down -v

# コンテナの起動
docker compose up -d
```

### ポート競合

```bash
# ポート使用状況の確認
lsof -i :3000  # フロントエンド
lsof -i :8000  # バックエンド
lsof -i :5432  # PostgreSQL

# プロセスを終了
kill -9 <PID>

# Dockerコンテナが5432を使っている場合
docker compose down
```

### データベース接続エラー

```bash
# PostgreSQLコンテナの起動確認
docker compose ps

# ヘルスチェック状態の確認
docker compose ps | grep postgres
# → "healthy" と表示されればOK

# コンテナが起動していない場合
docker compose up -d

# コンテナ内のPostgreSQLに直接接続して確認
docker compose exec postgres psql -U nishiyama_user -d nishiyama_canvas_dev
```

### Prismaマイグレーションエラー

```bash
# データベースをリセット（開発環境のみ！全データが削除されます）
cd apps/api
pnpm prisma migrate reset

# 再度マイグレーション実行
pnpm prisma migrate dev

# シードデータ投入
pnpm prisma db seed

# それでも解決しない場合は、Dockerコンテナごとリセット
docker compose down -v
docker compose up -d
sleep 10
pnpm prisma migrate dev
pnpm prisma db seed
```

## 📖 参考リンク

- [pnpm Documentation](https://pnpm.io/)
- [Turborepo Documentation](https://turbo.build/)
- [Next.js Documentation](https://nextjs.org/)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Biome Documentation](https://biomejs.dev/)
- [西山動物園オープンデータ](https://ckan.odp.jig.jp/)

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
