# 🎨 Nishiyama Canvas - Frontend (Web)

Next.js 15 + TypeScript で構築されたデジタルサイネージ作成・管理アプリケーションのフロントエンドです。

## 📦 技術スタック

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5+](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Jotai](https://jotai.org/)
- **Data Fetching**: 標準 Fetch API
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **WebSocket**: [Socket.io-client](https://socket.io/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Linter/Formatter**: [Biome](https://biomejs.dev/)

## 🚀 クイックスタート

### 前提条件

モノレポのルートで以下が完了していることを確認してください：

```bash
# ルートディレクトリで実行済みであること
pnpm install
docker compose up -d
cd packages/database && pnpm prisma migrate dev
```

詳細は[ルートのREADME](../../README.md)を参照してください。

### 開発サーバー起動

```bash
# フロントエンドのみ起動（ルートから）
pnpm run dev:web

# または、このディレクトリ（apps/web）から
pnpm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📝 利用可能なコマンド

### 開発

```bash
pnpm run dev              # 開発サーバー起動 (http://localhost:3000)
pnpm run build            # プロダクションビルド
pnpm run start            # プロダクションサーバー起動
```

### コード品質

```bash
pnpm run lint             # Biomeリンター実行
pnpm run format           # コードフォーマット（safe修正のみ）
pnpm run format:unsafe    # コードフォーマット（unsafe修正含む）
```

### テスト

```bash
pnpm test                 # ユニットテスト実行
pnpm test --watch         # テストウォッチモード
pnpm test --coverage      # カバレッジ取得
pnpm test:e2e             # E2Eテスト実行（Playwright）
pnpm test:e2e:ui          # PlaywrightのUIモードで実行
```

## 📁 ディレクトリ構造

```
apps/web/
├── public/              # 静的ファイル（画像、フォントなど）
├── src/
│   ├── app/             # Next.js App Router（ページ定義）
│   │   ├── layout.tsx   # ルートレイアウト
│   │   ├── page.tsx     # トップページ
│   │   └── globals.css  # グローバルスタイル
│   ├── components/      # Reactコンポーネント（予定）
│   │   ├── ui/          # shadcn/uiコンポーネント
│   │   ├── [features]/    # 機能別コンポーネント
│   │   └── layouts/     # レイアウトコンポーネント
│   ├── hooks/           # カスタムReact Hooks
│   ├── lib/             # ユーティリティ・ヘルパー（予定）
│   │   ├── api-client.ts   # APIクライアント（Hono RPC）
│   │   └── auth-client.ts  # BetterAuthクライアント
│   │   └── constants.ts    # 共通定数（基本的に@api/typesからインポートして使用）
│   ├── stores/          # Jotai atoms（グローバルステート）（予定）
│   └── types/           # 型定義（基本的に@api/typesからインポートして使用）
├── .env.local           # 環境変数（gitignore対象）
├── next.config.ts       # Next.js設定
├── tailwind.config.ts   # Tailwind CSS設定
├── tsconfig.json        # TypeScript設定
└── package.json         # 依存関係とスクリプト
```

## 🔧 環境変数

`.env.local`ファイルを作成して以下を設定してください：

```bash
# フロントエンドURL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# APIエンドポイント（バックエンド）
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 🎨 スタイリング（Tailwind CSS v4）

このプロジェクトはTailwind CSS v4を使用しています。

### 基本的な使い方

```tsx
export default function MyComponent() {
  return (
    <div className="flex items-center justify-center p-4 bg-white dark:bg-black">
      <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        Click me
      </button>
    </div>
  );
}
```

### shadcn/ui コンポーネントの追加

```bash
# コンポーネントを追加（例: Button）
pnpm dlx shadcn@latest add button

# 複数のコンポーネントを追加
pnpm dlx shadcn@latest add button card dialog
```

追加されたコンポーネントは`src/components/ui/`に配置されます。

## 🧩 状態管理（Jotai）

Jotaiを使用したシンプルな状態管理の例：

```typescript
// src/stores/user.ts
import { atom } from "jotai";

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
```

```tsx
// src/components/Header.tsx
import { useAtom } from "jotai";
import { userAtom } from "@/stores/user";

export default function Header() {
  const [user] = useAtom(userAtom);

  return <div>Welcome, {user?.name}!</div>;
}
```

## 🔌 APIクライアント（Fetch API）

標準のFetch APIを使ったデータフェッチの例：

```typescript
// src/lib/api/signage.ts
import type { Signage, CreateSignageInput } from "@nishiyama-canvas/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// GET: サイネージ一覧取得
export async function fetchSignages(): Promise<Signage[]> {
  const res = await fetch(`${API_URL}/api/signages`, {
    credentials: "include", // Cookie送信
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch signages: ${res.statusText}`);
  }

  return res.json();
}

// POST: サイネージ作成
export async function createSignage(data: CreateSignageInput): Promise<Signage> {
  const res = await fetch(`${API_URL}/api/signages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create signage: ${res.statusText}`);
  }

  return res.json();
}

// GET: 特定のサイネージ取得
export async function fetchSignageById(id: string): Promise<Signage> {
  const res = await fetch(`${API_URL}/api/signages/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch signage: ${res.statusText}`);
  }

  return res.json();
}

// PUT: サイネージ更新
export async function updateSignage(
  id: string,
  data: Partial<CreateSignageInput>,
): Promise<Signage> {
  const res = await fetch(`${API_URL}/api/signages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to update signage: ${res.statusText}`);
  }

  return res.json();
}

// DELETE: サイネージ削除
export async function deleteSignage(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/signages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete signage: ${res.statusText}`);
  }
}
```

### Next.jsのキャッシュ・Revalidation機能

Next.js 15のApp Routerでは、拡張されたFetch APIを使ってキャッシュとRevalidationを制御できます。

#### Server Componentsでのデータフェッチ（キャッシュ有効）

```typescript
// src/app/signages/[id]/page.tsx
import type { Signage } from "@nishiyama-canvas/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Server Componentでデータフェッチ（自動キャッシュ）
async function fetchSignage(id: string): Promise<Signage> {
  const res = await fetch(`${API_URL}/api/signages/${id}`, {
    // デフォルト: { cache: "force-cache" }
    // 60秒ごとにRevalidate
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch signage");
  }

  return res.json();
}

export default async function SignagePage({ params }: { params: { id: string } }) {
  const signage = await fetchSignage(params.id);

  return (
    <div>
      <h1>{signage.title}</h1>
      <p>{signage.description}</p>
    </div>
  );
}

// 静的パラメータ生成（SSG）
export async function generateStaticParams() {
  const res = await fetch(`${API_URL}/api/signages`);
  const signages: Signage[] = await res.json();

  return signages.map((signage) => ({
    id: signage.id,
  }));
}
```

#### キャッシュオプション

```typescript
// 常にキャッシュ（デフォルト）
fetch(url, { cache: "force-cache" });

// キャッシュしない（動的データ）
fetch(url, { cache: "no-store" });

// 60秒ごとにRevalidate（ISR）
fetch(url, { next: { revalidate: 60 } });

// タグベースのRevalidation
fetch(url, { next: { tags: ["signages"] } });
```

#### Server Actionsでの更新・Revalidation

```typescript
// src/app/actions/signage.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { CreateSignageInput } from "@nishiyama-canvas/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createSignageAction(data: CreateSignageInput) {
  const res = await fetch(`${API_URL}/api/signages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create signage");
  }

  const signage = await res.json();

  // パスベースのRevalidation
  revalidatePath("/signages");
  revalidatePath(`/signages/${signage.id}`);

  // または、タグベースのRevalidation
  revalidateTag("signages");

  return signage;
}
```

#### Client Componentでのデータフェッチ

```typescript
// src/components/SignageList.tsx
"use client";

import { useEffect, useState } from "react";
import type { Signage } from "@nishiyama-canvas/shared";
import { fetchSignages } from "@/lib/api/signage";

export function SignageList() {
  const [signages, setSignages] = useState<Signage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignages()
      .then(setSignages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <ul>
      {signages.map((signage) => (
        <li key={signage.id}>{signage.title}</li>
      ))}
    </ul>
  );
}
```

#### Streaming SSR（Suspense境界）

```tsx
// src/app/signages/page.tsx
import { Suspense } from "react";

async function SignageList() {
  const signages = await fetchSignages();
  return (
    <ul>
      {signages.map((s) => (
        <li key={s.id}>{s.title}</li>
      ))}
    </ul>
  );
}

export default function SignagesPage() {
  return (
    <div>
      <h1>サイネージ一覧</h1>
      <Suspense fallback={<div>読み込み中...</div>}>
        <SignageList />
      </Suspense>
    </div>
  );
}
```

## 📝 フォーム処理（React Hook Form + Zod）

```typescript
// src/lib/validation/signage.ts
import { z } from "zod";

export const createSignageSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

export type CreateSignageInput = z.infer<typeof createSignageSchema>;
```

```tsx
// src/components/SignageForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignageSchema, type CreateSignageInput } from "@/lib/validation/signage";

export default function SignageForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateSignageInput>({
    resolver: zodResolver(createSignageSchema),
  });

  const onSubmit = (data: CreateSignageInput) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} />
      {errors.title && <span>{errors.title.message}</span>}
      <button type="submit">作成</button>
    </form>
  );
}
```

## 🎯 ドラッグ&ドロップ（@dnd-kit）

サイネージエディタでのドラッグ&ドロップ実装例：

```tsx
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function DraggableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

function DroppableArea({ id, children }) {
  const { setNodeRef } = useDroppable({ id });

  return <div ref={setNodeRef}>{children}</div>;
}
```

## 🔄 WebSocket接続（Socket.io）

リアルタイム更新の実装例：

```typescript
// src/lib/socket.ts
import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000", {
  autoConnect: false,
});

// 接続
socket.connect();

// イベントリスナー
socket.on("content_updated", (data) => {
  console.log("コンテンツが更新されました:", data);
});

// 切断
socket.disconnect();
```

```tsx
// src/components/SignageViewer.tsx
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function SignageViewer({ signageId }: { signageId: string }) {
  useEffect(() => {
    socket.connect();

    socket.on("content_updated", (data) => {
      // コンテンツを更新
      console.log("更新:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [signageId]);

  return <div>サイネージビューアー</div>;
}
```

## 🧪 テスト

### ユニットテスト（Vitest）

```typescript
// src/components/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### E2Eテスト（Playwright）

```typescript
// e2e/signage.spec.ts
import { test, expect } from "@playwright/test";

test("サイネージを作成できる", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.click('text="サイネージ作成"');
  await page.fill('input[name="title"]', "テストサイネージ");
  await page.click('button[type="submit"]');
  await expect(page.locator("text=テストサイネージ")).toBeVisible();
});
```

## 📐 コーディング規約

### TypeScript

- **`any`、`unknown`の使用禁止**: すべての変数・関数に明示的な型定義
- **クラス使用禁止**: 関数型プログラミングスタイル（例外: `Error`クラスの拡張のみ許可）
- **ハードコード禁止**: マジックナンバーは定数化

### 良い例 ✅

```typescript
// 型定義を明示
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then((res) => res.json());
}

// ファクトリー関数を使用
type UserService = {
  getUser: (id: string) => Promise<User>;
};

const createUserService = (): UserService => ({
  getUser: (id: string) => fetch(`/api/users/${id}`).then((res) => res.json()),
});
```

### 悪い例 ❌

```typescript
// any型の使用
function processData(data: any) {
  return data.value;
}

// クラスの使用
class UserService {
  getUser(id: string) {
    // ...
  }
}
```

## 🔗 関連リンク

- [プロジェクトルートREADME](../../README.md) - セットアップガイド、全体構成
- [CLAUDE.md](../../CLAUDE.md) - AI開発ガイド、プロジェクト仕様
- [要件定義書](../../docs/requirements.md)
- [アーキテクチャ設計書](../../docs/architecture.md)
- [開発ガイドライン](../../docs/development-guidelines.md)
- [TDD開発ガイドライン](../../docs/tdd-guidelines.md)

## 📚 技術ドキュメント

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Jotai Documentation](https://jotai.org/docs/introduction)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Socket.io Documentation](https://socket.io/docs/v4/)

## 🔧 トラブルシューティング

### ポート3000が使用中

```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

### Next.jsのキャッシュをクリア

```bash
rm -rf .next
pnpm run dev
```

### 型エラーが解決しない

```bash
# TypeScriptサーバーを再起動（VSCode）
Cmd+Shift+P → "TypeScript: Restart TS Server"

# または、型定義を再生成
pnpm run type-check
```

### Tailwind CSSのスタイルが反映されない

```bash
# PostCSS設定を確認
cat postcss.config.mjs

# 開発サーバーを再起動
pnpm run dev
```
