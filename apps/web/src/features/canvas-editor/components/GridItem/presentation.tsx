"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  EditIcon,
  FileTextIcon,
  Newspaper,
  PawPrintIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LayoutItem } from "@/types";

type GridItemPresentationProps = {
  /** レイアウトアイテム */
  item: LayoutItem;
  /** 選択中かどうか */
  isSelected: boolean;
  /** ドラッグ中かどうか */
  isDragging: boolean;
  /** 削除ハンドラー */
  onDelete: () => void;
  /** 編集ハンドラー */
  onEdit: () => void;
  /** クリックハンドラー */
  onClick: () => void;
};

/**
 * コンテンツタイプに応じたアイコンを取得
 */
const getIconForType = (type: LayoutItem["type"]): React.JSX.Element => {
  const iconProps = { className: "h-6 w-6" };

  switch (type) {
    case "news":
      return <Newspaper {...iconProps} />;
    case "animal":
      return <PawPrintIcon {...iconProps} />;
    case "text":
      return <TypeIcon {...iconProps} />;
    case "user_image":
      return <FileTextIcon {...iconProps} />;
    default:
      return <FileTextIcon {...iconProps} />;
  }
};

/**
 * コンテンツタイプに応じたラベルを取得
 */
const getLabelForType = (type: LayoutItem["type"]): string => {
  switch (type) {
    case "news":
      return "ニュース";
    case "animal":
      return "動物情報";
    case "text":
      return "テキスト";
    case "user_image":
      return "ユーザー画像";
    default:
      return "アイテム";
  }
};

export const GridItemPresentation = ({
  item,
  isSelected,
  isDragging,
  onDelete,
  onEdit,
  onClick,
}: GridItemPresentationProps): React.JSX.Element => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const gridStyle: React.CSSProperties = {
    gridColumn: `${item.position.x + 1} / span ${item.position.w}`,
    gridRow: `${item.position.y + 1} / span ${item.position.h}`,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={gridStyle}
      className={cn("relative cursor-move transition-all duration-200", isDragging && "opacity-50")}
      {...attributes}
      {...listeners}
    >
      <Card
        className={cn(
          "flex h-full flex-col items-center justify-center gap-2 p-3 transition-all duration-200",
          isSelected
            ? "border-2 border-primary shadow-lg ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* 削除ボタン */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="削除"
        >
          <Trash2Icon className="h-3 w-3" />
        </Button>

        {/* 編集ボタン */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-1 left-1 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="編集"
        >
          <EditIcon className="h-3 w-3" />
        </Button>

        {/* アイコン */}
        <div className="text-muted-foreground">{getIconForType(item.type)}</div>

        {/* ラベル */}
        <div className="text-center font-medium text-foreground text-sm">
          {getLabelForType(item.type)}
        </div>

        {/* テキストコンテンツプレビュー */}
        {item.type === "text" && item.textContent && (
          <div className="line-clamp-2 px-2 text-center text-muted-foreground text-xs">
            {item.textContent}
          </div>
        )}

        {/* サイズバッジ */}
        <Badge variant="outline" className="text-xs">
          {item.position.w} × {item.position.h}
        </Badge>
      </Card>
    </div>
  );
};
