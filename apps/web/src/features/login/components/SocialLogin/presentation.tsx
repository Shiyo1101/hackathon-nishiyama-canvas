"use client";

import type { SocialProviderType } from "@api";
import type { ComponentProps } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { PROVIDER_CONFIGS } from "../../constants";

/**
 * ソーシャルログインコンポーネントのProps
 */
type SocialLoginPresentationProps = Omit<ComponentProps<typeof Button>, "children"> & {
  provider: SocialProviderType;
};

/**
 * ソーシャルログイン - Presentation Component
 *
 * UI表示とユーザーインタラクションを担当
 * - ボタンの表示（アイコン左配置、テキスト中央配置）
 * - ローディング状態管理
 * - クリックイベント処理
 * - 認証処理の実行
 */
export const SocialLoginPresentation = ({
  provider,
  className,
  ...props
}: SocialLoginPresentationProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const config = PROVIDER_CONFIGS[provider];

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: process.env.NEXT_PUBLIC_APP_URL,
      });
      // 成功時はリダイレクトされるため、ここには到達しない
    } catch (error) {
      console.error("Social login failed:", error);
      toast.error(
        `ログインに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex h-10 w-full items-center justify-between rounded-2xl border px-6 py-2 ${config?.bgColor} ${config?.textColor} ${config?.borderColor} ${config.label === "LINE" ? "pl-4.5" : ""} ${className}`}
      {...props}
    >
      <config.icon
        className={`h-6 w-6 object-contain ${config.label === "LINE" ? "h-9 w-9" : ""}`}
      />
      <span className="mx-auto font-bold">{config.label}でログイン</span>
      {/* 右側のスペーサー（アイコンと同じ幅を確保して中央揃え） */}
      <span className={`h-6 w-6 ${config.label === "LINE" ? "h-9 w-9" : ""}`} />
    </Button>
  );
};
