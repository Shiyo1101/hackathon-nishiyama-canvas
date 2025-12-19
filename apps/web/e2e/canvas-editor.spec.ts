import { expect, test } from "@playwright/test";

/**
 * キャンバスエディター E2Eテスト
 */
test.describe("キャンバスエディター", () => {
  test.beforeEach(async ({ page }) => {
    // エディターページに移動
    // 注: 実際のルートに応じて変更してください
    await page.goto("/canvas/edit");
  });

  test("ページが正しく表示される", async ({ page }) => {
    // タイトルが表示されることを確認
    await expect(page.getByRole("heading", { name: "キャンバスエディター" })).toBeVisible();

    // テンプレート選択ボタンが表示されることを確認
    await expect(page.getByRole("button", { name: "テンプレートを選択" })).toBeVisible();

    // 保存ボタンが表示されることを確認
    await expect(page.getByRole("button", { name: "保存" })).toBeVisible();
  });

  test("テンプレートを選択できる", async ({ page }) => {
    // テンプレート選択ボタンをクリック
    await page.getByRole("button", { name: "テンプレートを選択" }).click();

    // ダイアログが表示されることを確認
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("テンプレートを選択")).toBeVisible();

    // テンプレートカードが表示されることを確認
    const templateCards = page.getByRole("button").filter({ hasText: "ベーシック" });
    await expect(templateCards.first()).toBeVisible();

    // テンプレートを選択
    await templateCards.first().click();

    // ダイアログが閉じることを確認
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("グリッドアイテムが表示される", async ({ page }) => {
    // グリッドアイテムが表示されることを確認
    const gridItems = page.locator('[role="button"]').filter({ hasText: /ニュース|動物情報|画像/ });
    await expect(gridItems.first()).toBeVisible();
  });

  test("グリッドアイテムを選択できる", async ({ page }) => {
    // グリッドアイテムをクリック
    const firstItem = page.locator('[role="button"]').filter({ hasText: "ニュース" }).first();
    await firstItem.click();

    // 選択中のアイテム情報が表示されることを確認
    await expect(page.getByText("選択中のアイテム")).toBeVisible();
  });

  test("グリッドアイテムを削除できる", async ({ page }) => {
    // 初期アイテム数を取得
    const gridItems = page.locator('[role="button"]').filter({ hasText: /ニュース|動物情報|画像/ });
    const initialCount = await gridItems.count();

    // 削除ボタンをクリック
    const deleteButton = page.getByRole("button", { name: "削除" }).first();
    await deleteButton.click();

    // アイテムが減っていることを確認
    const newCount = await gridItems.count();
    expect(newCount).toBe(initialCount - 1);
  });

  test("保存ボタンをクリックできる", async ({ page }) => {
    // 保存ボタンをクリック
    await page.getByRole("button", { name: "保存" }).click();

    // 注: 実際のアプリケーションでは、保存成功のトーストや
    // リダイレクトなどを確認する必要があります
  });

  test("レイアウト情報が表示される", async ({ page }) => {
    // レイアウト情報カードが表示されることを確認
    await expect(page.getByText("レイアウト情報")).toBeVisible();

    // グリッド情報が表示されることを確認
    await expect(page.getByText(/グリッド:/)).toBeVisible();

    // アイテム数が表示されることを確認
    await expect(page.getByText(/アイテム数:/)).toBeVisible();
  });

  test.describe("テンプレートプレビュー", () => {
    test("詳細ボタンでプレビューが表示される", async ({ page }) => {
      // テンプレート選択ダイアログを開く
      await page.getByRole("button", { name: "テンプレートを選択" }).click();

      // 詳細ボタンをクリック
      await page.getByRole("button", { name: "詳細" }).first().click();

      // プレビューダイアログが表示されることを確認
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText("レイアウト情報")).toBeVisible();

      // 閉じるボタンで閉じる
      await page.getByRole("button", { name: "閉じる" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });
});
