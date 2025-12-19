/**
 * テキストカードコンポーネント
 *
 * テキストコンテンツを表示（XSS対策済み、スタイルカスタマイズ対応）
 */
"use client";

import {
  sanitizeStyleValue,
  sanitizeText,
  validateTextAlign,
  validateVerticalAlign,
} from "@/lib/sanitize";
import type { LayoutItem } from "@/types";

type TextCardProps = {
  /** テキストコンテンツ */
  content?: string;
  /** スタイル設定 */
  style?: LayoutItem["style"];
};

export const TextCard = ({ content, style }: TextCardProps): React.JSX.Element => {
  // XSS対策: テキストのサニタイズ
  const sanitizedContent = sanitizeText(content || "テキストを入力してください", 5000);

  // スタイル値のバリデーション・サニタイズ
  const fontSize = sanitizeStyleValue(style?.fontSize, "fontSize") || "16px";
  const fontWeight = style?.fontWeight || "normal";
  const color = sanitizeStyleValue(style?.color, "color") || "#000000";
  const backgroundColor = sanitizeStyleValue(style?.backgroundColor, "backgroundColor");
  const textAlign = validateTextAlign(style?.textAlign) || "center";
  const verticalAlign = validateVerticalAlign(style?.verticalAlign) || "center";
  const rotation = sanitizeStyleValue(style?.rotation, "rotation") || "0deg";
  const lineHeight = sanitizeStyleValue(style?.lineHeight, "lineHeight") || "1.5";
  const letterSpacing = sanitizeStyleValue(style?.letterSpacing, "letterSpacing") || "normal";

  // 縦方向の配置スタイル
  const alignItemsMap = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end",
  };

  return (
    <div
      className="flex size-full p-2"
      style={{
        alignItems: alignItemsMap[verticalAlign],
        justifyContent: textAlign,
        backgroundColor,
      }}
    >
      <p
        className="wrap-break-word w-full"
        style={{
          fontSize,
          fontWeight,
          color,
          textAlign,
          lineHeight,
          letterSpacing,
          transform: `rotate(${rotation})`,
          transformOrigin: "center",
          wordWrap: "break-word",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 10,
          WebkitBoxOrient: "vertical",
        }}
      >
        {sanitizedContent}
      </p>
    </div>
  );
};
