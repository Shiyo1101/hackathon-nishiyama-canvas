import type { SocialProviderType } from "@api";
import Image from "next/image";

/**
 * ソーシャルログインプロバイダーの設定
 */
export type ProviderConfig = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
};

/**
 * プロバイダーごとの設定
 */
export const PROVIDER_CONFIGS: Record<SocialProviderType, ProviderConfig> = {
  google: {
    label: "Google",
    icon: ({ className }) => (
      <Image
        src="/images/icons/google-logo.png"
        alt="Google"
        width={36}
        height={36}
        className={className}
      />
    ),
    bgColor: "bg-white hover:bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-[#545456]/34",
  },
  discord: {
    label: "Discord",
    icon: ({ className }) => (
      <Image
        src="/images/icons/discord-icon.svg"
        alt="Discord"
        width={36}
        height={36}
        className={className}
      />
    ),
    bgColor: "bg-[#5865F2] hover:bg-[#4752C4]",
    textColor: "text-white",
    borderColor: "border-none",
  },
  line: {
    label: "LINE",
    icon: ({ className }) => (
      <Image
        src="/images/icons/line_88.png"
        alt="LINE"
        width={36}
        height={36}
        className={className}
      />
    ),
    // LINE公式ブランドカラー: #06C755
    // ホバー: 基本色 + #000000（不透明度：10%）
    bgColor: "bg-[#06C755] hover:bg-[#06C755]/90",
    textColor: "text-white",
    borderColor: "border-none",
  },
};
