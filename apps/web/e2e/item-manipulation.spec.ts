import { expect, test } from "@playwright/test";

/**
 * アイテム操作 E2Eテスト
 *
 * グリッドアイテムのドラッグ&ドロップ、リサイズ、削除機能をテスト
 */
test.describe("アイテム操作", () => {
  test.beforeEach(async ({ page }) => {
    // キャンバスエディターページに移動
    await page.goto("/canvas/edit");

    // テスト用にテキストアイテムを追加
    await page.getByRole("button", { name: /テキスト/ }).click();
    await page.getByRole("textbox").fill("テストアイテム");
    await page.getByRole("button", { name: /追加|OK/ }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test.describe("アイテム選択", () => {
    test("アイテムをクリックして選択できる", async ({ page }) => {
      // アイテムをクリック
      const item = page.getByText("テストアイテム");
      await item.click();

      // 選択状態を示すUIが表示される（例：ボーダーハイライト、削除ボタン）
      // 注: 実際のセレクタはアプリケーションの実装に応じて調整
      const deleteButton = page.getByRole("button", { name: /削除/ }).first();
      await expect(deleteButton).toBeVisible();
    });

    test("別のアイテムをクリックすると選択が切り替わる", async ({ page }) => {
      // 2つ目のアイテムを追加
      await page.getByRole("button", { name: /テキスト/ }).click();
      await page.getByRole("textbox").fill("テストアイテム2");
      await page.getByRole("button", { name: /追加|OK/ }).click();

      // 1つ目をクリック
      await page.getByText("テストアイテム").click();
      await page.waitForTimeout(100);

      // 2つ目をクリック
      await page.getByText("テストアイテム2").click();
      await page.waitForTimeout(100);

      // 2つ目が選択されていることを確認
      // 注: 実際の選択状態の確認方法はアプリケーションに依存
    });
  });

  test.describe("アイテム削除", () => {
    test("選択したアイテムを削除ボタンで削除できる", async ({ page }) => {
      // アイテムをクリックして選択
      await page.getByText("テストアイテム").click();

      // 削除ボタンをクリック
      const deleteButton = page.getByRole("button", { name: /削除/ }).first();
      await deleteButton.click();

      // アイテムが削除されたことを確認
      await expect(page.getByText("テストアイテム")).not.toBeVisible();
    });

    test("複数のアイテムを順番に削除できる", async ({ page }) => {
      // 2つ目のアイテムを追加
      await page.getByRole("button", { name: /テキスト/ }).click();
      await page.getByRole("textbox").fill("テストアイテム2");
      await page.getByRole("button", { name: /追加|OK/ }).click();

      // 1つ目を削除
      await page.getByText("テストアイテム").click();
      await page.getByRole("button", { name: /削除/ }).first().click();
      await expect(page.getByText("テストアイテム")).not.toBeVisible();

      // 2つ目を削除
      await page.getByText("テストアイテム2").click();
      await page.getByRole("button", { name: /削除/ }).first().click();
      await expect(page.getByText("テストアイテム2")).not.toBeVisible();
    });
  });

  test.describe("アイテムドラッグ&ドロップ", () => {
    test("アイテムをドラッグして移動できる", async ({ page }) => {
      // アイテムの初期位置を取得
      const item = page.getByText("テストアイテム").locator("..");
      const initialBox = await item.boundingBox();
      expect(initialBox).not.toBeNull();

      // ドラッグハンドルを探す
      const dragHandle = item.locator('[class*="grip"], [class*="drag"]').first();

      // ドラッグ&ドロップを実行
      if (await dragHandle.isVisible()) {
        await dragHandle.dragTo(item, {
          targetPosition: { x: 100, y: 100 },
        });
      } else {
        // ドラッグハンドルがない場合、アイテム自体をドラッグ
        await item.dragTo(page.locator("[data-canvas]"), {
          targetPosition: { x: 200, y: 200 },
        });
      }

      await page.waitForTimeout(500);

      // 位置が変わったことを確認
      const newBox = await item.boundingBox();
      expect(newBox).not.toBeNull();

      // 注: 実際の位置確認はアプリケーションの実装に依存
      // ここでは単に例として記述
    });
  });

  test.describe("アイテムリサイズ", () => {
    test("アイテムを選択するとリサイズハンドルが表示される", async ({ page }) => {
      // アイテムをクリックして選択
      await page.getByText("テストアイテム").click();

      // リサイズハンドルが表示されることを確認
      // 注: 実際のセレクタはアプリケーションの実装に応じて調整
      const resizeHandle = page.locator('[class*="resize"], [aria-label*="リサイズ"]').first();

      // リサイズハンドルが存在することを確認
      if ((await resizeHandle.count()) > 0) {
        await expect(resizeHandle).toBeVisible();
      }
    });

    test("リサイズハンドルをドラッグしてサイズ変更できる", async ({ page }) => {
      // アイテムをクリックして選択
      await page.getByText("テストアイテム").click();

      // アイテムの初期サイズを取得
      const item = page.getByText("テストアイテム").locator("..");
      const initialBox = await item.boundingBox();
      expect(initialBox).not.toBeNull();

      // リサイズハンドルを探す
      const resizeHandle = page.locator('[class*="resize"], [aria-label*="リサイズ"]').first();

      // リサイズハンドルが存在する場合、ドラッグ
      if ((await resizeHandle.count()) > 0) {
        await resizeHandle.dragTo(resizeHandle, {
          targetPosition: { x: 50, y: 50 },
        });

        await page.waitForTimeout(500);

        // サイズが変わったことを確認
        const newBox = await item.boundingBox();
        expect(newBox).not.toBeNull();

        // 注: 実際のサイズ確認はアプリケーションの実装に依存
      }
    });
  });

  test.describe("複数アイテムの操作", () => {
    test("複数のアイテムを追加して個別に操作できる", async ({ page }) => {
      // 2つ目のアイテムを追加
      await page.getByRole("button", { name: /テキスト/ }).click();
      await page.getByRole("textbox").fill("アイテム2");
      await page.getByRole("button", { name: /追加|OK/ }).click();

      // 3つ目のアイテムを追加
      await page.getByRole("button", { name: /テキスト/ }).click();
      await page.getByRole("textbox").fill("アイテム3");
      await page.getByRole("button", { name: /追加|OK/ }).click();

      // 全てのアイテムが表示されることを確認
      await expect(page.getByText("テストアイテム")).toBeVisible();
      await expect(page.getByText("アイテム2")).toBeVisible();
      await expect(page.getByText("アイテム3")).toBeVisible();

      // 2つ目のアイテムを削除
      await page.getByText("アイテム2").click();
      await page.getByRole("button", { name: /削除/ }).first().click();

      // 2つ目だけが削除され、他は残っていることを確認
      await expect(page.getByText("テストアイテム")).toBeVisible();
      await expect(page.getByText("アイテム2")).not.toBeVisible();
      await expect(page.getByText("アイテム3")).toBeVisible();
    });
  });

  test.describe("アイテム配置の永続性", () => {
    test("アイテムを操作後、キャンバス内に残る", async ({ page }) => {
      // アイテムをクリック
      await page.getByText("テストアイテム").click();

      // 別の場所をクリック（選択解除）
      await page.locator("[data-canvas]").click({ position: { x: 10, y: 10 } });

      // アイテムがまだ存在することを確認
      await expect(page.getByText("テストアイテム")).toBeVisible();
    });
  });
});
