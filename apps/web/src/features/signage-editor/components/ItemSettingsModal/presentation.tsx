/**
 * アイテム設定モーダル - プレゼンテーションコンポーネント
 *
 * 配置済みアイテムの各種設定を編集するためのモーダル
 */
"use client";

import { Check, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LayoutItem } from "@/types";

type ItemSettingsModalPresentationProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 編集対象のアイテム */
  item: LayoutItem | null;
  /** モーダルを閉じる */
  onClose: () => void;
  /** 設定保存時のコールバック */
  onSave: (updatedItem: Partial<LayoutItem>) => void;
};

export const ItemSettingsModalPresentation = ({
  isOpen,
  item,
  onClose,
  onSave,
}: ItemSettingsModalPresentationProps): React.JSX.Element => {
  // 一意なID生成
  const overlayEnabledId = useId();
  const overlayColorId = useId();
  const autoRefreshId = useId();
  const slideshowIntervalId = useId();

  // タイマー設定
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [overlayColor, setOverlayColor] = useState<string>("#000000");

  // ニュース設定
  const [autoRefresh, setAutoRefresh] = useState(false);

  // スライドショー設定
  const [slideshowInterval, setSlideshowInterval] = useState(5000);

  // itemが変更されたら状態を初期化
  useEffect(() => {
    if (!item || !isOpen) {
      // リセット
      setOverlayEnabled(true);
      setOverlayColor("#000000");
      setAutoRefresh(false);
      setSlideshowInterval(5000);
      return;
    }

    // アイテムの設定を読み込み
    if (item.type === "timer") {
      setOverlayEnabled(item.style?.overlayEnabled ?? true);
      setOverlayColor(item.style?.overlayColor || "#000000");
    }

    if (item.type === "news") {
      setAutoRefresh(item.autoRefresh ?? false);
    }

    if (item.type === "animal" && item.contentIds) {
      setSlideshowInterval(item.slideshowInterval || 5000);
    }
  }, [item, isOpen]);

  const handleSave = (): void => {
    if (!item) return;

    const updates: Partial<LayoutItem> = {};

    if (item.type === "timer") {
      updates.style = {
        ...item.style,
        overlayEnabled,
        overlayColor,
      };
    }

    if (item.type === "news") {
      updates.autoRefresh = autoRefresh;
    }

    if (item.type === "animal" && item.contentIds) {
      updates.slideshowInterval = slideshowInterval;
    }

    onSave(updates);
    onClose();
  };

  if (!item) {
    return (
      <Dialog open={false}>
        <DialogContent />
      </Dialog>
    );
  }

  const getTitle = (): string => {
    switch (item.type) {
      case "timer":
        return "タイマー設定";
      case "news":
        return "ニュース設定";
      case "animal":
        return item.contentIds ? "スライドショー設定" : "動物情報設定";
      default:
        return "アイテム設定";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>アイテムの詳細設定を変更できます</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* タイマー設定 */}
          {item.type === "timer" && (
            <>
              {/* グラデーションオーバーレイ有効/無効 */}
              <div className="flex items-center space-x-2">
                <input
                  id={overlayEnabledId}
                  type="checkbox"
                  checked={overlayEnabled}
                  onChange={(e) => setOverlayEnabled(e.target.checked)}
                  className="size-4"
                />
                <Label htmlFor={overlayEnabledId} className="cursor-pointer">
                  グラデーションオーバーレイを適用
                </Label>
              </div>

              {/* オーバーレイカラー */}
              {overlayEnabled && (
                <div className="space-y-2">
                  <Label htmlFor={overlayColorId}>オーバーレイカラー</Label>
                  <div className="flex gap-2">
                    <Input
                      id={overlayColorId}
                      type="color"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    背景画像の上にグラデーションオーバーレイを適用します
                  </p>
                </div>
              )}
            </>
          )}

          {/* ニュース設定 */}
          {item.type === "news" && (
            <div className="flex items-center space-x-2">
              <input
                id={autoRefreshId}
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor={autoRefreshId} className="cursor-pointer">
                最新のニュースを自動取得（1時間ごと）
              </Label>
            </div>
          )}

          {/* スライドショー設定 */}
          {item.type === "animal" && item.contentIds && item.contentIds.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={slideshowIntervalId}>
                切り替え間隔: {slideshowInterval / 1000}秒
              </Label>
              <input
                id={slideshowIntervalId}
                type="range"
                min={1000}
                max={30000}
                step={1000}
                value={slideshowInterval}
                onChange={(e) => setSlideshowInterval(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* 設定がない場合 */}
          {item.type !== "timer" &&
            item.type !== "news" &&
            !(item.type === "animal" && item.contentIds && item.contentIds.length > 0) && (
              <p className="text-center text-muted-foreground text-sm">
                このアイテムに設定可能な項目はありません
              </p>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 size-4" />
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 size-4" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
