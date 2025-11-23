/**
 * サイネージエディターパネル プレゼンテーションコンポーネント
 *
 * ヘッダー（パンくずリスト）+ メインコンテンツ（エディター）のレイアウト
 */
"use client";

import type { SerializedSignage } from "@api";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useUnsavedChangesWarning } from "../../hooks";
import {
  initialLayoutConfigAtom,
  isPublicAtom,
  layoutConfigAtom,
  signageDescriptionAtom,
  signageIdAtom,
  signageSlugAtom,
  signageTitleAtom,
  thumbnailUrlAtom,
} from "../../store/atoms";
import { EditorCanvas } from "../EditorCanvas";
import { EditorToolbar } from "../EditorToolbar";

type SignageEditorPanelPresentationProps = {
  /** 初期サイネージデータ */
  initialSignage?: SerializedSignage | null;
  /** 保存成功時のコールバック */
  onSaveSuccess?: () => void;
};

export const SignageEditorPanelPresentation = ({
  initialSignage,
  onSaveSuccess,
}: SignageEditorPanelPresentationProps): React.JSX.Element => {
  const setLayoutConfig = useSetAtom(layoutConfigAtom);
  const setInitialLayoutConfig = useSetAtom(initialLayoutConfigAtom);
  const setSignageId = useSetAtom(signageIdAtom);
  const setSignageTitle = useSetAtom(signageTitleAtom);
  const setSignageDescription = useSetAtom(signageDescriptionAtom);
  const setIsPublic = useSetAtom(isPublicAtom);
  const setSignageSlug = useSetAtom(signageSlugAtom);
  const setThumbnailUrl = useSetAtom(thumbnailUrlAtom);

  // 未保存変更警告フックを有効化
  useUnsavedChangesWarning();

  /**
   * 初期データをストアに設定
   */
  useEffect(() => {
    if (initialSignage) {
      setSignageId(initialSignage.id);
      setSignageTitle(initialSignage.title);
      setSignageDescription(initialSignage.description);
      setIsPublic(initialSignage.isPublic);
      setSignageSlug(initialSignage.slug);
      setThumbnailUrl(initialSignage.thumbnailUrl);

      // layoutConfigをパース
      if (initialSignage.layoutConfig) {
        const parsedLayout = initialSignage.layoutConfig as never;
        setLayoutConfig(parsedLayout);
        // 初期レイアウトも保存（未保存変更の比較用）
        setInitialLayoutConfig(parsedLayout);
      }
    }
  }, [
    initialSignage,
    setLayoutConfig,
    setInitialLayoutConfig,
    setSignageId,
    setSignageTitle,
    setSignageDescription,
    setIsPublic,
    setSignageSlug,
    setThumbnailUrl,
  ]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      {/* 左側ツールバー（リサイズ可能、ハンドル付き） */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
        <EditorToolbar />
      </ResizablePanel>

      {/* 右側キャンバス */}
      <ResizablePanel defaultSize={75} className="p-4">
        <Card className="h-full">
          <EditorCanvas onSaveSuccess={onSaveSuccess} />
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
