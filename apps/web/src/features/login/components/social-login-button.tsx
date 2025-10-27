import type { SocialProviderType } from "@api/types";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { PROVIDER_CONFIGS } from "../config/provider-config";

/**
 * ソーシャルログインボタンのProps
 * Presentational Component - UIのみを担当
 */
export interface SocialLoginButtonProps extends Omit<ComponentProps<typeof Button>, "children"> {
  provider: SocialProviderType;
  isLoading?: boolean;
}

/**
 * ソーシャルログインボタン
 *
 * プロバイダーに応じたアイコンとラベルを表示する純粋なUIコンポーネント
 * データ取得や状態管理は行わず、propsで受け取った情報のみを表示
 */
export const SocialLoginButton = ({
  provider,
  isLoading = false,
  className,
  ...props
}: SocialLoginButtonProps): React.JSX.Element => {
  const config = PROVIDER_CONFIGS[provider];

  return (
    <Button
      className={`${config?.bgColor} ${config?.textColor} ${className} text-white`}
      disabled={isLoading}
      {...props}
    >
      <config.icon />
      {config.label}でログイン
    </Button>
  );
};
