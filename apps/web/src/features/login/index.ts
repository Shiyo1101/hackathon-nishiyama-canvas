/**
 * 認証機能のエクスポート
 *
 * featuresディレクトリは機能ごとにモジュール化
 * 外部からはindex.tsを通してのみアクセス
 */

export type { SocialLoginButtonProps } from "./components/social-login-button";

// Components (Presentational)
export { SocialLoginButton } from "./components/social-login-button";
export type { ProviderConfig } from "./config/provider-config";

// Config
export { PROVIDER_CONFIGS } from "./config/provider-config";
export type { SocialLoginContainerProps } from "./containers/social-login-container";

// Containers
export { SocialLoginContainer } from "./containers/social-login-container";
