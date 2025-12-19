import { expect, test } from "@playwright/test";

/**
 * コンテンツ選択フロー E2Eテスト
 *
 * ニュースや動物画像を選択してグリッドに追加する機能をテスト
 */
test.describe("コンテンツ選択フロー", () => {
  test.beforeEach(async ({ page }) => {
    // キャンバスエディターページに移動
    // 注: 実際のルートに応じて変更してください
    await page.goto("/canvas/edit");
  });

  test.describe("ニュース選択", () => {
    test("ニュースボタンをクリックしてモーダルを開ける", async ({ page }) => {
      // ニュースボタンを探す
      const newsButton = page.getByRole("button", { name: /ニュース/ });
      await expect(newsButton).toBeVisible();

      // クリックしてモーダルを開く
      await newsButton.click();

      // モーダルが表示されることを確認
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/ニュースを選択/)).toBeVisible();
    });

    test("ニュースを選択してグリッドに追加できる", async ({ page }) => {
      // 初期状態のグリッドアイテム数を取得
      const initialItems = await page.locator("[data-canvas] > div").count();

      // ニュースボタンをクリック
      await page.getByRole("button", { name: /ニュース/ }).click();

      // モーダル内でニュースを選択
      const newsItem = page
        .locator('[role="button"]')
        .filter({ hasText: /テスト/ })
        .first();
      if (await newsItem.isVisible()) {
        await newsItem.click();
      }

      // 選択ボタンをクリック
      const selectButton = page.getByRole("button", { name: /選択/ });
      if (await selectButton.isVisible()) {
        await selectButton.click();
      }

      // モーダルが閉じることを確認
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // グリッドに新しいアイテムが追加されたことを確認
      const newItems = await page.locator("[data-canvas] > div").count();
      expect(newItems).toBeGreaterThan(initialItems);
    });

    test("ニュースを選択せずにモーダルを閉じられる", async ({ page }) => {
      // ニュースボタンをクリック
      await page.getByRole("button", { name: /ニュース/ }).click();

      // モーダルが表示される
      await expect(page.getByRole("dialog")).toBeVisible();

      // キャンセルボタンまたはX(閉じる)ボタンをクリック
      const closeButton = page.getByRole("button", { name: /キャンセル|閉じる/ }).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // モーダルが閉じることを確認
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });

  test.describe("動物画像選択", () => {
    test("動物画像ボタンをクリックしてモーダルを開ける", async ({ page }) => {
      // 動物画像ボタンを探す
      const animalButton = page.getByRole("button", { name: /動物/ });
      await expect(animalButton).toBeVisible();

      // クリックしてモーダルを開く
      await animalButton.click();

      // モーダルが表示されることを確認
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/画像を選択/)).toBeVisible();
    });

    test("動物画像を選択してグリッドに追加できる", async ({ page }) => {
      // 初期状態のグリッドアイテム数を取得
      const initialItems = await page.locator("[data-canvas] > div").count();

      // 動物画像ボタンをクリック
      await page.getByRole("button", { name: /動物/ }).click();

      // モーダル内で画像を選択
      const imageItem = page.locator('[role="button"]').first();
      if (await imageItem.isVisible()) {
        await imageItem.click();
      }

      // 選択ボタンをクリック
      const selectButton = page.getByRole("button", { name: /選択/ });
      if (await selectButton.isVisible()) {
        await selectButton.click();
      }

      // モーダルが閉じることを確認
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // グリッドに新しいアイテムが追加されたことを確認
      const newItems = await page.locator("[data-canvas] > div").count();
      expect(newItems).toBeGreaterThan(initialItems);
    });
  });

  test.describe("テキスト追加", () => {
    test("テキストボタンをクリックしてモーダルを開ける", async ({ page }) => {
      // テキストボタンを探す
      const textButton = page.getByRole("button", { name: /テキスト/ });
      await expect(textButton).toBeVisible();

      // クリックしてモーダルを開く
      await textButton.click();

      // モーダルが表示されることを確認
      await expect(page.getByRole("dialog")).toBeVisible();
    });

    test("テキストを入力してグリッドに追加できる", async ({ page }) => {
      // 初期状態のグリッドアイテム数を取得
      const initialItems = await page.locator("[data-canvas] > div").count();

      // テキストボタンをクリック
      await page.getByRole("button", { name: /テキスト/ }).click();

      // テキストを入力
      const textarea = page.getByRole("textbox");
      await textarea.fill("テストテキスト");

      // 追加ボタンをクリック
      const addButton = page.getByRole("button", { name: /追加|OK/ });
      await addButton.click();

      // モーダルが閉じることを確認
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // グリッドに新しいアイテムが追加されたことを確認
      const newItems = await page.locator("[data-canvas] > div").count();
      expect(newItems).toBeGreaterThan(initialItems);

      // テキストが表示されることを確認
      await expect(page.getByText("テストテキスト")).toBeVisible();
    });
  });

  test.describe("複数コンテンツ追加", () => {
    test("複数の異なるコンテンツを追加できる", async ({ page }) => {
      // テキストを追加
      await page.getByRole("button", { name: /テキスト/ }).click();
      await page.getByRole("textbox").fill("テスト1");
      await page.getByRole("button", { name: /追加|OK/ }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // もう一つテキストを追加
      await page.getByRole("button", { name: /テキスト/ }).click();
      await page.getByRole("textbox").fill("テスト2");
      await page.getByRole("button", { name: /追加|OK/ }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // 両方のテキストが表示されることを確認
      await expect(page.getByText("テスト1")).toBeVisible();
      await expect(page.getByText("テスト2")).toBeVisible();
    });
  });
});
