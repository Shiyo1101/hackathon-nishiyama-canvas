/**
 * タイマー背景画像選択モーダル - プレゼンテーションコンポーネント
 *
 * タイマーコンポーネントの背景に使用する動物画像を選択するためのモーダルダイアログ
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
import { AnimalImageSelector } from "../AnimalImageSelector";

type TimerBackgroundSelectionModalPresentationProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じる */
  onClose: () => void;
  /** 背景画像選択時のコールバック (imageIdと画像URLを返す) */
  onSelectImage: (imageId: string, imageUrl: string) => void;
};

export const TimerBackgroundSelectionModalPresentation = ({
  isOpen,
  onClose,
  onSelectImage,
}: TimerBackgroundSelectionModalPresentationProps): React.JSX.Element => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // モーダルを閉じる際に選択状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setSelectedImageUrl(null);
    }
  }, [isOpen]);

  const handleSelect = (): void => {
    if (selectedId && selectedImageUrl) {
      onSelectImage(selectedId, selectedImageUrl);
      onClose();
    }
  };

  const handleItemClick = async (imageId: string): Promise<void> => {
    setSelectedId(imageId);

    // 画像URLを取得（APIから画像情報を取得）
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/animals/images/${imageId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("画像情報の取得に失敗しました");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("画像情報の取得に失敗しました");
      }

      setSelectedImageUrl(data.data.image.imageUrl);
    } catch (error) {
      console.error("Error fetching image URL:", error);
      setSelectedImageUrl(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>タイマー背景画像を選択</DialogTitle>
          <DialogDescription>タイマーの背景に表示する動物画像を選択してください</DialogDescription>
        </DialogHeader>

        {/* 背景画像選択エリア - スクロール可能 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AnimalImageSelector onItemClick={handleItemClick} selectedId={selectedId} />
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 size-4" />
            キャンセル
          </Button>
          <Button onClick={handleSelect} disabled={!selectedId}>
            <Check className="mr-2 size-4" />
            選択
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
