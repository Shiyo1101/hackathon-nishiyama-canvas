/**
 * タイマーカードコンポーネント
 *
 * 現在時刻をリアルタイムで表示（背景画像対応）
 */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { sanitizeStyleValue, validateTextAlign, validateVerticalAlign } from "@/lib/sanitize";
import type { LayoutItem } from "@/types";

type TimerCardProps = {
  /** スタイル設定 */
  style?: LayoutItem["style"];
  /** 背景画像URL（オプション） */
  backgroundImage?: string;
};

export const TimerCard = ({ style, backgroundImage }: TimerCardProps): React.JSX.Element => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // スタイル値のバリデーション・サニタイズ
  const fontSize = sanitizeStyleValue(style?.fontSize, "fontSize") || "48px";
  const fontWeight = style?.fontWeight || "bold";
  const color = sanitizeStyleValue(style?.color, "color") || "#ffffff";
  const backgroundColor = sanitizeStyleValue(style?.backgroundColor, "backgroundColor");
  const textAlign = validateTextAlign(style?.textAlign) || "center";
  const verticalAlign = validateVerticalAlign(style?.verticalAlign) || "center";
  const format = style?.format || "24h";
  const showSeconds = style?.showSeconds ?? true;
  const overlayEnabled = style?.overlayEnabled ?? true; // デフォルトで有効
  const overlayColor = style?.overlayColor
    ? sanitizeStyleValue(style.overlayColor, "color")
    : "#000000"; // デフォルトは黒

  // 1秒ごとに時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 時刻フォーマット関数
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (format === "12h") {
      // 12時間形式
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const minutesStr = minutes.toString().padStart(2, "0");
      const secondsStr = seconds.toString().padStart(2, "0");

      if (showSeconds) {
        return `${displayHours}:${minutesStr}:${secondsStr} ${period}`;
      }
      return `${displayHours}:${minutesStr} ${period}`;
    }
    // 24時間形式（デフォルト）
    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");

    if (showSeconds) {
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }
    return `${hoursStr}:${minutesStr}`;
  };

  // 日付フォーマット関数
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 縦方向の配置スタイル
  const alignItemsMap = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end",
  };

  // デフォルトの背景画像（グラデーション）
  const defaultBackgroundImage = "https://placehold.co/800x600.png?text=Timer+Background";

  return (
    <div className="relative size-full overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage || defaultBackgroundImage}
          alt="Timer background"
          fill
          priority
          className="object-cover opacity-40"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* グラデーションオーバーレイ（オプション） */}
      {overlayEnabled && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, ${overlayColor}80, ${overlayColor}4D, transparent)`,
          }}
        />
      )}

      {/* コンテンツ */}
      <div
        className="relative z-10 flex size-full flex-col px-8 py-6"
        style={{
          alignItems: textAlign,
          justifyContent: alignItemsMap[verticalAlign],
          backgroundColor: backgroundColor || undefined,
        }}
      >
        <div className="space-y-2" style={{ textAlign }}>
          <div
            className="font-bold drop-shadow-lg"
            style={{
              fontSize,
              fontWeight,
              color,
            }}
          >
            {formatTime(currentTime)}
          </div>
          <div
            className="text-2xl drop-shadow-md"
            style={{
              color,
            }}
          >
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
};
