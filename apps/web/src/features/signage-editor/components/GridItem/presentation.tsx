"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  FileTextIcon,
  ImageIcon,
  Newspaper,
  PawPrintIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    case "image":
      return <ImageIcon {...iconProps} />;
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
    case "image":
      return "画像";
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
  onClick,
}: GridItemPresentationProps): React.JSX.Element => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    gridColumn: `${item.position.x + 1} / span ${item.position.w}`,
    gridRow: `${item.position.y + 1} / span ${item.position.h}`,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "move",
    border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    position: "relative",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: isSelected ? "0 4px 6px -1px rgba(59, 130, 246, 0.2)" : "none",
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      type="button"
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

      {/* アイコン */}
      <div className="text-gray-600">{getIconForType(item.type)}</div>

      {/* ラベル */}
      <div className="text-center font-medium text-gray-700 text-sm">
        {getLabelForType(item.type)}
      </div>

      {/* テキストコンテンツ */}
      {item.type === "text" && item.textContent && (
        <div className="line-clamp-2 text-center text-gray-500 text-xs">{item.textContent}</div>
      )}

      {/* サイズ表示 */}
      <div className="text-gray-400 text-xs">
        {item.position.w} × {item.position.h}
      </div>
    </button>
  );
};
