# Features ディレクトリ

機能ごとにモジュール化されたディレクトリ構造。

## 設計原則

### 1. **機能ベースの構造**

各機能は独立したディレクトリとして管理され、関連するすべてのコードを含む。

### 2. **Container/Presentational パターン**

#### Presentational Components（表示コンポーネント）

- **役割**: UIの表示のみを担当
- **特徴**:
  - propsでデータを受け取る
  - ビジネスロジックを持たない
  - 再利用可能でテストしやすい
  - 状態を持たない（またはUIの状態のみ）
  - useTransitionなど用いたフォームデータの送信（Transition内でのServerActionの実行）は行う

#### Container Components（コンテナコンポーネント）

- **役割**: データ取得と状態管理を担当
- **特徴**:
  - ServerActionやAPIの呼び出し
  - 状態管理（useState, useTransitionなど）
  - Presentational Componentsにpropsを渡す
  - ビジネスロジックを含む

### 3. **明確な責任分離**

```
features/[feature-name]/
├── actions/           # Server Actions（サーバーサイド処理）
├── components/        # Presentational Components（UI表示）
├── containers/        # Container Components（データ取得・状態管理）
├── config/            # 設定・定数
├── hooks/             # カスタムフック（オプション）
├── types/             # 型定義（オプション）
└── index.ts           # エクスポート（外部からはこのファイル経由でアクセス）
```

## 現在の機能

### auth（認証機能）

ソーシャルログイン機能を提供。

```
features/auth/
├── actions/
│   └── sign-in.ts                    # Server Actions: ソーシャルログイン処理
├── components/
│   └── social-login-button.tsx       # Presentational: ログインボタンUI
├── containers/
│   └── social-login-container.tsx    # Container: ボタンの状態管理
├── config/
│   └── provider-config.tsx           # プロバイダー設定（Google, Discord, LINE）
└── index.ts                          # エクスポート
```

#### 使用例

```typescript
// Presentational Component（直接使用する場合）
import { SocialLoginButton } from '@/features/auth';

<SocialLoginButton
  provider="google"
  onClick={handleClick}
  isLoading={loading}
/>

// Container Component（推奨）
import { SocialLoginContainer } from '@/features/auth';

<SocialLoginContainer provider="google" className="w-full" />
```

#### データフロー

```
User Click
  ↓
SocialLoginContainer (Container)
  ├─ useTransition (状態管理)
  ├─ signIn (Server Action呼び出し)
  └─ SocialLoginButton (Presentational)
        ├─ PROVIDER_CONFIGS (設定取得)
        └─ UI レンダリング
              ↓
Better Auth API
  ↓
OAuth Provider (Google/Discord/LINE)
```

## 新しい機能の追加

### ステップ1: ディレクトリ作成

```bash
mkdir -p apps/web/src/features/new-feature/{actions,components,containers,config}
```

### ステップ2: ファイル作成

**Presentational Component（`components/`）**

```typescript
// components/my-component.tsx
export interface MyComponentProps {
  data: string;
  onAction: () => void;
}

export const MyComponent = ({ data, onAction }: MyComponentProps) => {
  return <button onClick={onAction}>{data}</button>;
};
```

**Container Component（`containers/`）**

```typescript
// containers/my-container.tsx
"use client";

import { useTransition } from 'react';
import { myAction } from '../actions/my-action';
import { MyComponent } from '../components/my-component';

export const MyContainer = () => {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    startTransition(async () => {
      await myAction();
    });
  };

  return <MyComponent data="Hello" onAction={handleAction} />;
};
```

**Server Actions（`actions/`）**

```typescript
// actions/my-action.ts
"use server";

export const myAction = async () => {
  // サーバーサイド処理
};
```

**エクスポート（`index.ts`）**

```typescript
// index.ts
export { MyComponent } from './components/my-component';
export { MyContainer } from './containers/my-container';
export { myAction } from './actions/my-action';
```

### ステップ3: 使用

```typescript
import { MyContainer } from '@/features/new-feature';

<MyContainer />
```

## ベストプラクティス

### ✅ DO（推奨）

1. **機能の独立性を保つ**
   - 各featureは他のfeatureに直接依存しない
   - 共通機能は`lib/`や`components/ui/`に配置

2. **index.tsを通してエクスポート**

   ```typescript
   // ✅ Good
   import { MyComponent } from '@/features/my-feature';

   // ❌ Bad
   import { MyComponent } from '@/features/my-feature/components/my-component';
   ```

3. **Container/Presentational分離を徹底**
   - UIロジックとビジネスロジックを分離
   - テストしやすいコードを書く

4. **型定義を明確に**
   - すべてのpropsに型を定義
   - `any`や`unknown`を避ける

### ❌ DON'T（非推奨）

1. **featuresディレクトリに無関係なコードを配置しない**
   - 共通UIコンポーネント → `components/ui/`
   - ユーティリティ関数 → `lib/`
   - グローバル型定義 → `types/`

2. **Presentational Componentに状態管理を含めない**

   ```typescript
   // ❌ Bad: Presentational Componentで状態管理
   export const MyComponent = () => {
     const [data, setData] = useState();
     const [isPending, startTransition] = useTransition();
     // ...
   };

   // ✅ Good: Containerで状態管理
   export const MyContainer = () => {
     const [isPending, startTransition] = useTransition();
     return <MyComponent onAction={handleAction} />;
   };
   ```

3. **循環依存を作らない**
   - feature A → feature B → feature A のような依存関係は避ける

## 参考資料

- [Container/Presentational Pattern](https://www.patterns.dev/posts/presentational-container-pattern)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js App Router](https://nextjs.org/docs/app)
