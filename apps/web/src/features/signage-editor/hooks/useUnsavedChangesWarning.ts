/**
 * 未保存変更警告フック
 *
 * ページ離脱時やブラウザを閉じる時に、未保存の変更がある場合に警告を表示する
 */
"use client";

import { useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";
import { hasUnsavedChangesAtom } from "../store/atoms";

type UseUnsavedChangesWarningOptions = {
  /** 警告を有効にするかどうか（デフォルト: true） */
  enabled?: boolean;
  /** カスタム警告メッセージ */
  message?: string;
};

/**
 * 未保存変更警告フック
 */
export const useUnsavedChangesWarning = ({
  enabled = true,
  message = "変更が保存されていません。ページを離れますか？",
}: UseUnsavedChangesWarningOptions = {}): void => {
  const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);

  /**
   * beforeunloadイベントハンドラー（ブラウザを閉じる時やリロード時）
   */
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent): string | undefined => {
      if (enabled && hasUnsavedChanges) {
        // 標準的な警告メッセージを表示
        // 注: 最近のブラウザでは、カスタムメッセージは無視され、ブラウザのデフォルトメッセージが表示されます
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = message;
        return message;
      }
      return undefined;
    },
    [enabled, hasUnsavedChanges, message],
  );

  /**
   * ページ内ナビゲーション時の警告
   * Next.js App Routerでは、beforeunloadだけでは不十分なため、
   * router.pushをインターセプトする必要があります
   */
  useEffect(() => {
    if (!enabled) return;

    // beforeunloadイベントリスナーを追加
    window.addEventListener("beforeunload", handleBeforeUnload);

    return (): void => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, handleBeforeUnload]);

  /**
   * Next.js App Routerでのページ遷移時の警告
   * 注: Next.js 13+ App Routerでは、routeChangeイベントが使えないため、
   * Link クリックや router.push を直接制御する必要があります
   * ここでは、beforeunloadのみで対応し、必要に応じて各Linkに確認処理を追加します
   */
};
