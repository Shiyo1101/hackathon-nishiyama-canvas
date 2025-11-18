/**
 * エディターツールバー - プレゼンテーションコンポーネント
 *
 * 左側サイドバーに表示され、ドラッグ可能なコンテンツアイテムと設定パネルを提供
 */

import { FileText, Image, Newspaper, Sparkles, Type, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ContentItemType, LayoutConfig } from "@/types";

/**
 * ドラッグ可能なコンテンツアイテムの定義
 */
const DRAGGABLE_ITEMS: Array<{
  type: ContentItemType;
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
    type: "text",
    label: "テキスト",
    icon: Type,
    description: "カスタムテキストを追加",
  },
  {
    type: "image",
    label: "公式画像",
    icon: Image,
    description: "動物園公式の画像を表示",
  },
  {
    type: "user_image",
    label: "自分の画像",
    icon: Upload,
    description: "アップロードした画像を表示",
  },
];

type EditorToolbarPresentationProps = {
  /** 現在のレイアウト設定 */
  layout: LayoutConfig | null;
  /** ドラッグ開始時のハンドラー */
  onDragStart?: (type: ContentItemType, event: React.DragEvent) => void;
  /** ドラッグ終了時のハンドラー */
  onDragEnd?: () => void;
};

export const EditorToolbarPresentation = ({
  layout,
  onDragStart,
  onDragEnd,
}: EditorToolbarPresentationProps): React.JSX.Element => {
  return (
    <div className="relative flex h-full flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* コンテンツアイテムセクション */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">コンテンツを追加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DRAGGABLE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(e) => onDragStart?.(item.type, e)}
                    onDragEnd={onDragEnd}
                    className="flex cursor-move items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary hover:bg-accent"
                  >
                    <Icon className="size-5 text-muted-foreground" />
                    <div className="flex-1">
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

          {/* 使い方セクション */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">使い方</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-3 shrink-0" />
                  <span>コンテンツをドラッグしてキャンバスに配置</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-3 shrink-0" />
                  <span>アイテムをクリックして選択・編集</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-3 shrink-0" />
                  <span>ドラッグして位置を変更</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* リサイズハンドル */}
      <ResizableHandle withHandle className="absolute top-0 right-0 h-full" />
    </div>
  );
};
