"use client";

import { Eye, Redo, Save, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title?: string;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onSave?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
}

export function DashboardHeader({
  title = "にしやまきゃんばす！",
  onUndo,
  onRedo,
  onPreview,
  onSave,
  canUndo = false,
  canRedo = false,
  isSaving = false,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-[#f3ebe7] border-b px-10 py-3 dark:border-text-light/10">
      <div className="flex items-center gap-4">
        <svg
          className="h-6 w-6 text-text-light dark:text-text-dark"
          fill="currentColor"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Logo</title>
          <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" />
        </svg>
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        {onUndo && (
          <Button variant="secondary" size="icon" onClick={onUndo} disabled={!canUndo}>
            <Undo className="h-5 w-5" />
          </Button>
        )}
        {onRedo && (
          <Button variant="secondary" size="icon" onClick={onRedo} disabled={!canRedo}>
            <Redo className="h-5 w-5" />
          </Button>
        )}
        {onPreview && (
          <Button variant="secondary" onClick={onPreview}>
            <Eye className="h-4 w-4" />
            プレビュー
          </Button>
        )}
        {onSave && (
          <Button onClick={onSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        )}
      </div>
    </header>
  );
}
