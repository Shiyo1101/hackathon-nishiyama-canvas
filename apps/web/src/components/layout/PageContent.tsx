import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * ページコンテンツコンポーネント
 *
 * ページのメインコンテンツエリアを定義
 * 必要に応じて背景色やボーダーなどのスタイルを追加可能
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageContent>
 *     <h2>セクションタイトル</h2>
 *     <p>コンテンツ</p>
 *   </PageContent>
 * </PageContainer>
 * ```
 */
export const PageContent = ({ children, className }: PageContentProps) => {
  return <div className={cn("space-y-6", className)}>{children}</div>;
};
