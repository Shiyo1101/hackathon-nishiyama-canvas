import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * 最大幅を設定
   * @default "6xl" (max-w-6xl = 1152px)
   */
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl" | "full";
  /**
   * 水平方向のパディング
   * @default "8" (px-8 = 2rem)
   */
  paddingX?: "4" | "6" | "8" | "10" | "12";
  /**
   * 垂直方向のパディング
   * @default "6" (py-6 = 1.5rem)
   */
  paddingY?: "4" | "6" | "8" | "10" | "12";
};

/**
 * ページコンテナコンポーネント
 *
 * ページ全体の最大幅と余白を統一的に管理するコンテナ
 * Headerと同じ最大幅（max-w-6xl）を使用して、レイアウトの一貫性を保つ
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <h1>ダッシュボード</h1>
 *   <p>コンテンツ</p>
 * </PageContainer>
 * ```
 *
 * @example カスタム設定
 * ```tsx
 * <PageContainer maxWidth="7xl" paddingY="12">
 *   <h1>ワイドレイアウト</h1>
 * </PageContainer>
 * ```
 */
export const PageContainer = ({
  children,
  className,
  maxWidth = "6xl",
  paddingX = "8",
  paddingY = "6",
}: PageContainerProps) => {
  const maxWidthClasses = {
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  const paddingXClasses = {
    "4": "px-4",
    "6": "px-6",
    "8": "px-8",
    "10": "px-10",
    "12": "px-12",
  };

  const paddingYClasses = {
    "4": "py-4",
    "6": "py-6",
    "8": "py-8",
    "10": "py-10",
    "12": "py-12",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        paddingXClasses[paddingX],
        paddingYClasses[paddingY],
        className,
      )}
    >
      {children}
    </div>
  );
};
