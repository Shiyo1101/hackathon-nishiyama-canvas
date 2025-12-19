/**
 * 全画面表示ボタン Presentationコンポーネント
 *
 * UIレンダリングとユーザーインタラクション処理を担当
 */
"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { LayoutConfig } from "@/types";
import { CanvasPreviewCanvas } from "../CanvasPreviewCanvas";

type FullscreenButtonPresentationProps = {
  layoutConfig: LayoutConfig;
};

export const FullscreenButtonPresentation = ({
  layoutConfig,
}: FullscreenButtonPresentationProps): React.JSX.Element => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

  // クライアントサイドでのマウント確認
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 全画面状態の変更を監視
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // 全画面終了時のクリーンアップ
      if (!isCurrentlyFullscreen && fullscreenContainerRef.current) {
        document.body.removeChild(fullscreenContainerRef.current);
        fullscreenContainerRef.current = null;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 全画面表示の切り替え
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      // 全画面コンテナを作成
      const fullscreenDiv = document.createElement("div");
      fullscreenDiv.id = "canvas-fullscreen-container";
      fullscreenDiv.style.cssText = `
        position: fixed;
        inset: 0;
        background: black;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // DOMに追加
      document.body.appendChild(fullscreenDiv);
      fullscreenContainerRef.current = fullscreenDiv;

      // 全画面化
      try {
        await fullscreenDiv.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Fullscreen request failed:", err);
        document.body.removeChild(fullscreenDiv);
        fullscreenContainerRef.current = null;
      }
    } else {
      // 全画面終了
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Exit fullscreen failed:", err);
      }
    }
  }, []);

  // クリーンアップ: コンポーネントアンマウント時
  useEffect(() => {
    return () => {
      if (
        fullscreenContainerRef.current &&
        document.body.contains(fullscreenContainerRef.current)
      ) {
        document.body.removeChild(fullscreenContainerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Button size="sm" onClick={toggleFullscreen}>
        {isFullscreen ? (
          <>
            <Minimize2 className="mr-2 h-4 w-4" />
            全画面終了
          </>
        ) : (
          <>
            <Maximize2 className="mr-2 h-4 w-4" />
            全画面表示
          </>
        )}
      </Button>

      {/* 全画面モード時のReactコンテンツをPortalでレンダリング */}
      {isMounted &&
        isFullscreen &&
        fullscreenContainerRef.current &&
        createPortal(
          <div
            style={{
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%" }}>
              <CanvasPreviewCanvas layoutConfig={layoutConfig} />
            </div>
          </div>,
          fullscreenContainerRef.current,
        )}
    </>
  );
};
