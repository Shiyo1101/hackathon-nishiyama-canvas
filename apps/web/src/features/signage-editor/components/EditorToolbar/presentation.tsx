/**
 * エディターツールバー - プレゼンテーションコンポーネント
 *
 * 左側サイドバーに表示され、ドラッグ可能なコンテンツアイテムと設定パネルを提供
 * 状態管理とイベントハンドリングを含むClient Component
 */
"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Clock, CloudSun, Images, Newspaper, Sparkles, Type, Upload } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ContentItemType, LayoutItem } from "@/types";
import { useHistory } from "../../hooks";
import { addLayoutItemAtom, layoutConfigAtom, pendingEditItemIdAtom } from "../../store/atoms";
import { draggingItemTypeAtom } from "../../store/drag-atoms";
import { ContentSelectionModal } from "../ContentSelectionModal";
import { ImageUploadModal } from "../ImageUploadModal";
import { TextInputModal } from "../TextInputModal";
import { TimerBackgroundSelectionModal } from "../TimerBackgroundSelectionModal";

/**
 * ドラッグ可能なコンテンツアイテムの定義
 */
const DRAGGABLE_ITEMS: Array<{
  type: ContentItemType | "slideshow";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    type: "news",
    label: "ニュース",
    icon: Newspaper,
    description: "動物園からのニュースを表示",
  },
  {
    type: "animal",
    label: "動物情報",
    icon: Sparkles,
    description: "レッサーパンダの情報を表示",
  },
  {
    type: "slideshow",
    label: "スライドショー",
    icon: Images,
    description: "複数の動物画像を自動切替",
  },
  {
    type: "text",
    label: "テキスト",
    icon: Type,
    description: "カスタムテキストを追加",
  },
  {
    type: "user_image",
    label: "自分の画像",
    icon: Upload,
    description: "アップロードした画像を表示",
  },
  {
    type: "weather",
    label: "天気情報",
    icon: CloudSun,
    description: "天気予報を表示",
  },
  {
    type: "timer",
    label: "タイマー",
    icon: Clock,
    description: "現在時刻を表示",
  },
];

export const EditorToolbarPresentation = (): React.JSX.Element => {
  const layout = useAtomValue(layoutConfigAtom);
  const setDraggingItemType = useSetAtom(draggingItemTypeAtom);
  const addLayoutItem = useSetAtom(addLayoutItemAtom);
  const setPendingEditItemId = useSetAtom(pendingEditItemIdAtom);
  const { pushHistory } = useHistory();

  // モーダル状態管理
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isSlideshowModalOpen, setIsSlideshowModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isTimerBackgroundModalOpen, setIsTimerBackgroundModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<ContentItemType | null>(null);

  const handleItemClick = (type: ContentItemType | "slideshow"): void => {
    if (type === "slideshow") {
      // スライドショーモード
      setIsSlideshowModalOpen(true);
    } else if (type === "text") {
      setIsTextModalOpen(true);
    } else if (type === "user_image") {
      setIsImageUploadModalOpen(true);
    } else if (type === "timer") {
      // タイマーは背景画像選択モーダルを表示
      setIsTimerBackgroundModalOpen(true);
    } else if (type === "weather") {
      // 天気情報はcontentIdを必要としないため、直接追加
      handleAddDirectItem(type);
    } else {
      setSelectedContentType(type);
      setIsContentModalOpen(true);
    }
  };

  const handleAddDirectItem = (type: ContentItemType): void => {
    if (!layout) return;

    // アイテム追加前に現在の状態を履歴に保存
    pushHistory();

    // デフォルト位置(中央)にアイテムを追加
    const centerX = Math.floor(layout.grid.columns / 2) - 1;
    const centerY = Math.floor(layout.grid.rows / 2) - 1;

    addLayoutItem({
      id: nanoid(),
      type,
      position: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        w: 3,
        h: 2,
      },
      // タイマーのデフォルトスタイル設定
      style:
        type === "timer"
          ? {
              format: "24h",
              showSeconds: true,
              fontSize: "24px",
              color: "#000000",
            }
          : undefined,
    });
  };

  const handleDragStart = (type: ContentItemType | "slideshow", event: React.DragEvent): void => {
    if (type === "slideshow") return; // スライドショーはドラッグ不可
    setDraggingItemType(type);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", type);
  };

  const handleDragEnd = (): void => {
    setDraggingItemType(null);
  };

  const handleSelectContent = (contentId: string, contentType: ContentItemType): void => {
    if (!layout) return;

    // アイテム追加前に現在の状態を履歴に保存
    pushHistory();

    // デフォルト位置(中央)にアイテムを追加
    const centerX = Math.floor(layout.grid.columns / 2) - 1;
    const centerY = Math.floor(layout.grid.rows / 2) - 1;

    addLayoutItem({
      id: nanoid(),
      type: contentType,
      position: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        w: 2,
        h: 2,
      },
      contentId,
    });
  };

  const handleSelectContents = (contentIds: string[], contentType: ContentItemType): void => {
    if (!layout) return;

    // アイテム追加前に現在の状態を履歴に保存
    pushHistory();

    // デフォルト位置(中央)にスライドショーアイテムを追加
    const centerX = Math.floor(layout.grid.columns / 2) - 1;
    const centerY = Math.floor(layout.grid.rows / 2) - 1;

    addLayoutItem({
      id: nanoid(),
      type: contentType,
      position: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        w: 3,
        h: 3,
      },
      contentIds,
      slideshowInterval: 5000, // デフォルト5秒
    });
  };

  const handleTextSubmit = (
    text: string,
    style?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      backgroundColor?: string;
      textAlign?: "left" | "center" | "right";
      verticalAlign?: "top" | "center" | "bottom";
      rotation?: number;
      lineHeight?: string;
      letterSpacing?: string;
    },
  ): void => {
    if (!layout) return;

    // アイテム追加前に現在の状態を履歴に保存
    pushHistory();

    // デフォルト位置(中央)にテキストアイテムを追加
    const centerX = Math.floor(layout.grid.columns / 2) - 1;
    const centerY = Math.floor(layout.grid.rows / 2) - 1;

    addLayoutItem({
      id: nanoid(),
      type: "text",
      position: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        w: 3,
        h: 2,
      },
      textContent: text,
      style,
    });
  };

  const handleCloseContentModal = (): void => {
    setIsContentModalOpen(false);
    setSelectedContentType(null);
  };

  const handleCloseSlideshowModal = (): void => {
    setIsSlideshowModalOpen(false);
  };

  const handleCloseTextModal = (): void => {
    setIsTextModalOpen(false);
  };

  const handleImageUploadSuccess = (imageId: string): void => {
    if (!layout) return;

    // アイテム追加前に現在の状態を履歴に保存
    pushHistory();

    // デフォルト位置(中央)にユーザー画像アイテムを追加
    const centerX = Math.floor(layout.grid.columns / 2) - 1;
    const centerY = Math.floor(layout.grid.rows / 2) - 1;

    addLayoutItem({
      id: nanoid(),
      type: "user_image",
      position: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        w: 2,
        h: 2,
      },
      contentId: imageId,
    });
  };

  const handleCloseImageUploadModal = (): void => {
    setIsImageUploadModalOpen(false);
  };

  const handleTimerBackgroundSelect = (imageId: string, imageUrl: string): void => {
    if (!layout) return;

    // アイテム追加前に現在の状態を履歴に保存
    pushHistory();

    // デフォルト位置(中央)にタイマーアイテムを追加
    const centerX = Math.floor(layout.grid.columns / 2) - 1;
    const centerY = Math.floor(layout.grid.rows / 2) - 1;

    const newItemId = nanoid();
    const newItem: LayoutItem = {
      id: newItemId,
      type: "timer",
      position: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        w: 3,
        h: 2,
      },
      contentId: imageId,
      backgroundImageUrl: imageUrl,
      style: {
        format: "24h",
        showSeconds: true,
        fontSize: "48px",
        color: "#ffffff",
        overlayEnabled: true,
        overlayColor: "#000000",
      },
    };

    addLayoutItem(newItem);

    // モーダルを閉じる
    setIsTimerBackgroundModalOpen(false);

    // タイマー追加後に設定モーダルを開くためのトリガー
    setTimeout(() => {
      setPendingEditItemId(newItemId);
    }, 100);
  };

  const handleCloseTimerBackgroundModal = (): void => {
    setIsTimerBackgroundModalOpen(false);
  };

  return (
    <>
      <div className="relative flex h-full flex-col bg-background">
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {/* コンテンツアイテムセクション */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">コンテンツを追加</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DRAGGABLE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  // ニュース、動物、公式画像、テキスト、ユーザー画像、天気、タイマーはクリックでモーダル表示
                  const needsModal = [
                    "news",
                    "animal",
                    "slideshow",
                    "image",
                    "text",
                    "user_image",
                    "weather",
                    "timer",
                  ].includes(item.type);
                  // ドラッグ&ドロップは無効化（全てクリックでモーダル表示）
                  const isDraggable = false;
                  const handleKeyDown = (e: React.KeyboardEvent): void => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (needsModal) {
                        handleItemClick(item.type);
                      }
                    }
                  };

                  return (
                    // biome-ignore lint/a11y/useSemanticElements: <!-- IGNORE -->
                    <div
                      key={item.type}
                      role="button"
                      tabIndex={0}
                      draggable={isDraggable}
                      onClick={() => needsModal && handleItemClick(item.type)}
                      onKeyDown={handleKeyDown}
                      onDragStart={(e) => isDraggable && handleDragStart(item.type, e)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center transition-colors hover:border-primary hover:bg-accent ${
                        isDraggable ? "cursor-move" : "cursor-pointer"
                      }`}
                    >
                      <Icon className="size-6 text-muted-foreground" />
                      <div className="w-full">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-muted-foreground text-xs">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Separator />

            {/* レイアウト情報セクション */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">レイアウト情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {layout ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">グリッド:</span>
                      <span className="font-medium">
                        {layout.grid.columns} × {layout.grid.rows}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">アイテム数:</span>
                      <span className="font-medium">{layout.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">背景:</span>
                      <span className="font-medium">
                        {layout.background.type === "color" ? "単色" : "画像"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">レイアウトを読み込み中...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* リサイズハンドル */}
        <ResizableHandle withHandle className="absolute top-0 right-0 h-full" />
      </div>

      {/* モーダル */}
      <ContentSelectionModal
        isOpen={isContentModalOpen}
        contentType={selectedContentType}
        onClose={handleCloseContentModal}
        onSelectContent={handleSelectContent}
      />
      <ContentSelectionModal
        isOpen={isSlideshowModalOpen}
        contentType="animal"
        onClose={handleCloseSlideshowModal}
        onSelectContent={handleSelectContent}
        onSelectContents={handleSelectContents}
        enableMultiSelect={true}
      />
      <TextInputModal
        isOpen={isTextModalOpen}
        onClose={handleCloseTextModal}
        onSubmit={handleTextSubmit}
      />
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={handleCloseImageUploadModal}
        onUploadSuccess={handleImageUploadSuccess}
      />
      <TimerBackgroundSelectionModal
        isOpen={isTimerBackgroundModalOpen}
        onClose={handleCloseTimerBackgroundModal}
        onSelectImage={handleTimerBackgroundSelect}
      />
    </>
  );
};
