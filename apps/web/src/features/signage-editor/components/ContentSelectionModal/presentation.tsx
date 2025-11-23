/**
 * コンテンツ選択モーダル - プレゼンテーションコンポーネント
 *
 * ニュースや動物画像を選択するためのモーダルダイアログ
 * 状態管理とイベントハンドリングを含むClient Component
 */
"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContentItemType } from "@/types";
import { AnimalImageSelector } from "../AnimalImageSelector";
import { NewsSelector } from "../NewsSelector";

type ContentSelectionModalPresentationProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 選択するコンテンツタイプ */
  contentType: ContentItemType | null;
  /** モーダルを閉じる */
  onClose: () => void;
  /** コンテンツ選択時のコールバック */
  onSelectContent: (contentId: string, contentType: ContentItemType) => void;
  /** 複数コンテンツ選択時のコールバック（スライドショー用） */
  onSelectContents?: (contentIds: string[], contentType: ContentItemType) => void;
  /** 複数選択モード（スライドショー）を有効にするか */
  enableMultiSelect?: boolean;
};

const CONTENT_TYPE_LABELS: Record<ContentItemType, string> = {
  news: "ニュース",
  animal: "動物情報",
  text: "テキスト",
  user_image: "自分の画像",
  weather: "天気情報",
  timer: "タイマー",
};

export const ContentSelectionModalPresentation = ({
  isOpen,
  contentType,
  onClose,
  onSelectContent,
  onSelectContents,
  enableMultiSelect = false,
}: ContentSelectionModalPresentationProps): React.JSX.Element => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // モーダルを閉じる際に選択状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setSelectedIds([]);
    }
  }, [isOpen]);

  const handleSelect = (): void => {
    if (enableMultiSelect) {
      // 複数選択モード
      if (selectedIds.length > 0 && contentType) {
        onSelectContents?.(selectedIds, contentType);
        onClose();
      }
    } else {
      // 単一選択モード
      if (selectedId && contentType) {
        onSelectContent(selectedId, contentType);
        onClose();
      }
    }
  };

  const handleItemClick = (id: string): void => {
    setSelectedId(id);
  };

  const handleItemsSelect = (ids: string[]): void => {
    setSelectedIds(ids);
  };

  // コンテンツタイプに応じた選択UIをレンダリング
  const renderSelector = (): React.ReactNode => {
    if (!contentType) return null;

    switch (contentType) {
      case "news":
        return <NewsSelector onItemClick={handleItemClick} selectedId={selectedId} />;
      case "animal":
        // 複数選択モードの場合
        if (enableMultiSelect) {
          return (
            <AnimalImageSelector
              selectedIds={selectedIds}
              onItemsSelect={handleItemsSelect}
              maxSelection={3}
            />
          );
        }
        // 単一選択モード
        return <AnimalImageSelector onItemClick={handleItemClick} selectedId={selectedId} />;
      default:
        return (
          <div className="text-center text-muted-foreground">
            このコンテンツタイプはサポートされていません
          </div>
        );
    }
  };

  const title = contentType
    ? `${CONTENT_TYPE_LABELS[contentType]}を選択${enableMultiSelect ? "（最大3枚）" : ""}`
    : "コンテンツを選択";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>配置するコンテンツを選択してください</DialogDescription>
        </DialogHeader>

        {/* コンテンツ選択エリア - スクロール可能 */}
        <div className="min-h-0 flex-1 overflow-y-auto">{renderSelector()}</div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 size-4" />
            キャンセル
          </Button>
          <Button
            onClick={handleSelect}
            disabled={enableMultiSelect ? selectedIds.length === 0 : !selectedId}
          >
            <Check className="mr-2 size-4" />
            選択
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
