"use client";

import type { SocialProviderType } from "@api/types";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { SocialLoginButtonProps } from "../components/social-login-button";
import { SocialLoginButton } from "../components/social-login-button";

export interface SocialLoginContainerProps
  extends Omit<SocialLoginButtonProps, "isLoading" | "onClick"> {
  provider: SocialProviderType;
}

export const SocialLoginContainer = ({
  provider,
  ...props
}: SocialLoginContainerProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: process.env.NEXT_PUBLIC_APP_URL,
      });
    } catch (error) {
      console.error("Social login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <SocialLoginButton provider={provider} isLoading={isLoading} onClick={handleClick} {...props} />
  );
};
