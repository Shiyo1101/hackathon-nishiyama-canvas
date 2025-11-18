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
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  isPublicAtom,
  layoutConfigAtom,
  signageDescriptionAtom,
  signageIdAtom,
  signageSlugAtom,
  signageTitleAtom,
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
  const setSignageId = useSetAtom(signageIdAtom);
  const setSignageTitle = useSetAtom(signageTitleAtom);
  const setSignageDescription = useSetAtom(signageDescriptionAtom);
  const setIsPublic = useSetAtom(isPublicAtom);
  const setSignageSlug = useSetAtom(signageSlugAtom);

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

      // layoutConfigをパース
      if (initialSignage.layoutConfig) {
        setLayoutConfig(initialSignage.layoutConfig as never);
      }
    }
  }, [
    initialSignage,
    setLayoutConfig,
    setSignageId,
    setSignageTitle,
    setSignageDescription,
    setIsPublic,
    setSignageSlug,
  ]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
      {/* 左側ツールバー（リサイズ可能、ハンドル付き） */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
        <EditorToolbar />
      </ResizablePanel>

      {/* 右側キャンバス */}
      <ResizablePanel defaultSize={80}>
        <Card className="h-full rounded-none border-0">
          <EditorCanvas onSaveSuccess={onSaveSuccess} />
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
