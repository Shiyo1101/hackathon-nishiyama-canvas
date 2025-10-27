"use client";

import { Image, Newspaper, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  onGridChange?: (columns: number, rows: number) => void;
  currentGrid?: { columns: number; rows: number };
}

const gridOptions = [
  { label: "2x2", columns: 2, rows: 2 },
  { label: "3x3", columns: 3, rows: 3 },
  { label: "4x4", columns: 4, rows: 4 },
];

const contentTypes = [
  { icon: Image, label: "画像", type: "image" },
  { icon: Newspaper, label: "ニュース", type: "news" },
  { icon: Type, label: "テキスト", type: "text" },
  { icon: Palette, label: "背景", type: "background" },
];

export function EditorSidebar({
  onGridChange,
  currentGrid = { columns: 2, rows: 2 },
}: EditorSidebarProps) {
  return (
    <aside className="w-80 border-[#f3ebe7] border-r bg-white p-6 dark:border-text-light/10 dark:bg-background-dark">
      <div className="flex flex-col gap-6">
        {/* コンテンツセクション */}
        <div className="flex flex-col gap-4">
          <p className="px-2 font-medium text-sm text-text-light/70 dark:text-text-dark/70">
            コンテンツ
          </p>
          <div className="grid grid-cols-2 gap-4">
            {contentTypes.map(({ icon: Icon, label, type }) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: <editor side>
              <div
                key={type}
                className="flex cursor-grab flex-col items-center gap-2 rounded-xl bg-[#f3ebe7] p-4 transition-all hover:bg-primary/50 active:cursor-grabbing dark:bg-text-light/10"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("contentType", type);
                }}
              >
                <Icon className="h-8 w-8 text-text-light dark:text-text-dark" />
                <p className="font-medium text-sm text-text-light dark:text-text-dark">{label}</p>
              </div>
            ))}
          </div>
        </div>
        軽微
        <Separator />
        {/* グリッドセクション */}
        <div className="flex flex-col gap-4">
          <p className="px-2 font-medium text-sm text-text-light/70 dark:text-text-dark/70">
            グリッド
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-[#f3ebe7] p-1 dark:bg-text-light/10">
            {gridOptions.map(({ label, columns, rows }) => (
              <Button
                key={label}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 flex-1 rounded-lg",
                  currentGrid.columns === columns && currentGrid.rows === rows
                    ? "bg-background-light dark:bg-background-dark"
                    : "",
                )}
                onClick={() => onGridChange?.(columns, rows)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
