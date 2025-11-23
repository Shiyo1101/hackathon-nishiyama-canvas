# E2Eテスト (Playwright)

サイネージエディターの主要機能をテストするE2Eテストスイート。

## 📋 テストファイル一覧

### 1. `signage-editor.spec.ts`

サイネージエディターの基本機能テスト

- ページ表示
- テンプレート選択
- グリッドアイテム表示
- レイアウト情報表示

### 2. `content-selection.spec.ts`

コンテンツ選択フローのテスト

- **ニュース選択**: モーダルを開いてニュースを選択しグリッドに追加
- **動物画像選択**: モーダルを開いて動物画像を選択しグリッドに追加
- **テキスト追加**: テキスト入力モーダルでテキストをグリッドに追加
- **複数コンテンツ追加**: 複数の異なるコンテンツを追加

### 3. `item-manipulation.spec.ts`

アイテム操作機能のテスト

- **アイテム選択**: クリックでアイテムを選択
- **アイテム削除**: 削除ボタンでアイテムを削除
- **ドラッグ&ドロップ**: アイテムを別の位置に移動
- **リサイズ**: アイテムのサイズ変更
- **複数アイテム操作**: 複数アイテムの追加と個別操作

## 🚀 実行方法

### 全てのE2Eテストを実行

```bash
pnpm --filter web e2e
```

### UIモードで実行（推奨）

```bash
pnpm --filter web e2e:ui
```

### デバッグモードで実行

```bash
pnpm --filter web e2e:debug
```

### 特定のテストファイルのみ実行

```bash
# コンテンツ選択テストのみ
pnpm --filter web playwright test content-selection.spec.ts

# アイテム操作テストのみ
pnpm --filter web playwright test item-manipulation.spec.ts
```

### ヘッドレスモードで実行（CI用）

```bash
pnpm --filter web playwright test --headed=false
```

## 📊 テストカバレッジ

### コンテンツ選択フロー

- [x] ニュース選択モーダルの開閉
- [x] ニュースの選択とグリッド追加
- [x] 動物画像選択モーダルの開閉
- [x] 動物画像の選択とグリッド追加
- [x] テキスト入力モーダルの開閉
- [x] テキストの入力とグリッド追加
- [x] 複数の異なるコンテンツの追加

### アイテム操作

- [x] アイテムのクリック選択
- [x] 選択アイテムの切り替え
- [x] 削除ボタンによるアイテム削除
- [x] 複数アイテムの順次削除
- [x] ドラッグ&ドロップによるアイテム移動
- [x] リサイズハンドルの表示
- [x] リサイズによるサイズ変更
- [x] 複数アイテムの個別操作
- [x] アイテム配置の永続性

## 🔧 テスト環境設定

### 前提条件

1. **開発サーバー**: E2Eテスト実行時に自動起動（`playwright.config.ts`で設定済み）
2. **データベース**: シードデータが投入されている状態
3. **ブラウザ**: Chromium（Playwright同梱）

### 環境変数

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📝 テスト作成ガイドライン

### セレクタの優先順位

1. **role + accessible name**: `page.getByRole("button", { name: "保存" })`
2. **text**: `page.getByText("テストアイテム")`
3. **test ID**: `page.getByTestId("item-1")`（推奨しない）
4. **CSS selector**: 最終手段

### 待機戦略

- **明示的待機**: `await expect(element).toBeVisible()` （推奨）
- **タイムアウト**: `await page.waitForTimeout(500)` （最小限に）
- **自動待機**: Playwrightが自動で要素を待機

### テストの独立性

- 各テストは独立して実行可能
- `beforeEach`で初期状態をセットアップ
- 他のテストの結果に依存しない

## 🐛 トラブルシューティング

### テストが失敗する場合

1. **スクリーンショット確認**: `test-results/`ディレクトリ
2. **トレース確認**: `playwright show-trace trace.zip`
3. **UIモードでデバッグ**: `pnpm e2e:ui`

### よくある問題

- **タイムアウト**: 要素が表示されない → セレクタを確認
- **要素が見つからない**: テキストやroleが変更されていないか確認
- **不安定なテスト**: 明示的な待機を追加

## 📚 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [ベストプラクティス](https://playwright.dev/docs/best-practices)
- [テストジェネレータ](https://playwright.dev/docs/codegen)

## 🎯 今後の拡張

- [ ] サイネージ保存機能のテスト
- [ ] 公開/非公開切り替えのテスト
- [ ] ユーザー画像アップロードのテスト
- [ ] スタイルカスタマイズのテスト
- [ ] レスポンシブデザインのテスト
- [ ] パフォーマンステスト
