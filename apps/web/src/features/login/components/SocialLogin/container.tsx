import type { SocialProviderType } from "@api";
import type { ComponentProps } from "react";
import type { Button } from "@/components/ui/button";
import { SocialLoginPresentation } from "./presentation";

/**
 * ソーシャルログインコンテナのProps
 */
type SocialLoginContainerProps = Omit<ComponentProps<typeof Button>, "children"> & {
  provider: SocialProviderType;
};

/**
 * ソーシャルログイン - Container Component
 *
 * データの受け渡しとPresentationコンポーネントの呼び出しのみを担当
 * このコンポーネントはServer Componentとして動作可能だが、
 * Presentationコンポーネントに直接propsを渡すだけの薄いラッパーとなっている
 */
export const SocialLoginContainer = ({
  provider,
  ...props
}: SocialLoginContainerProps): React.JSX.Element => {
  return <SocialLoginPresentation provider={provider} {...props} />;
};
