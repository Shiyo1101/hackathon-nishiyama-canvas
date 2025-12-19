/**
 * キャンバスエディターパネル プレゼンテーションコンポーネント
 *
 * ヘッダー（パンくずリスト）+ メインコンテンツ（エディター）のレイアウト
 */
"use client";

import type { SerializedCanvas } from "@api";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import type { LayoutConfig } from "@/types";
import { useUnsavedChangesWarning } from "../../hooks";
import {
  canvasDescriptionAtom,
  canvasIdAtom,
  canvasSlugAtom,
  canvasTitleAtom,
  initialLayoutConfigAtom,
  isPublicAtom,
  layoutConfigAtom,
  thumbnailUrlAtom,
} from "../../store/atoms";
import { EditorCanvas } from "../EditorCanvas";
import { EditorToolbar } from "../EditorToolbar";

type CanvasEditorPanelPresentationProps = {
  /** 初期キャンバスデータ */
  initialCanvas?: SerializedCanvas | null;
  /** 保存成功時のコールバック */
  onSaveSuccess?: () => void;
};

export const CanvasEditorPanelPresentation = ({
  initialCanvas,
  onSaveSuccess,
}: CanvasEditorPanelPresentationProps): React.JSX.Element => {
  const setLayoutConfig = useSetAtom(layoutConfigAtom);
  const setInitialLayoutConfig = useSetAtom(initialLayoutConfigAtom);
  const setCanvasId = useSetAtom(canvasIdAtom);
  const setCanvasTitle = useSetAtom(canvasTitleAtom);
  const setCanvasDescription = useSetAtom(canvasDescriptionAtom);
  const setIsPublic = useSetAtom(isPublicAtom);
  const setCanvasSlug = useSetAtom(canvasSlugAtom);
  const setThumbnailUrl = useSetAtom(thumbnailUrlAtom);

  // 未保存変更警告フックを有効化
  useUnsavedChangesWarning();

  /**
   * 初期データをストアに設定
   */
  useEffect(() => {
    if (initialCanvas) {
      setCanvasId(initialCanvas.id);
      setCanvasTitle(initialCanvas.title);
      setCanvasDescription(initialCanvas.description);
      setIsPublic(initialCanvas.isPublic);
      setCanvasSlug(initialCanvas.slug);
      setThumbnailUrl(initialCanvas.thumbnailUrl);

      // layoutConfigをパース
      if (initialCanvas.layoutConfig) {
        // バックエンドから受け取ったlayoutConfigを正規化（template_id → templateId）
        const backendLayout = initialCanvas.layoutConfig as {
          template_id: string;
          background: LayoutConfig["background"];
          grid: LayoutConfig["grid"];
          items: LayoutConfig["items"];
        };

        const normalizedLayout: LayoutConfig = {
          templateId: backendLayout.template_id,
          background: backendLayout.background,
          grid: backendLayout.grid,
          items: backendLayout.items,
        };

        setLayoutConfig(normalizedLayout);
        // 初期レイアウトも保存(未保存変更の比較用)
        setInitialLayoutConfig(normalizedLayout);
      }
    } else {
      // キャンバスが未作成の場合、デフォルトのレイアウト設定を初期化
      const defaultLayout: LayoutConfig = {
        templateId: "default",
        background: {
          type: "color",
          value: "#ffffff",
        },
        grid: {
          columns: 12,
          rows: 8,
          gap: 8,
        },
        items: [],
      };
      setLayoutConfig(defaultLayout);
      setInitialLayoutConfig(defaultLayout);
    }
  }, [
    initialCanvas,
    setLayoutConfig,
    setInitialLayoutConfig,
    setCanvasId,
    setCanvasTitle,
    setCanvasDescription,
    setIsPublic,
    setCanvasSlug,
    setThumbnailUrl,
  ]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      {/* 左側ツールバー(リサイズ可能、ハンドル付き) */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
        <EditorToolbar />
      </ResizablePanel>

      {/* 右側キャンバス */}
      <ResizablePanel defaultSize={75} className="p-4">
        <Card className="h-full">
          <EditorCanvas onSaveSuccessAction={onSaveSuccess} />
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
