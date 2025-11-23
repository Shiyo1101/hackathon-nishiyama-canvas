"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SignageTemplate } from "@/types";

type TemplateSelectorPresentationProps = {
  /** テンプレート一覧 */
  templates: SignageTemplate[];
  /** テンプレート選択時のコールバック */
  onSelectTemplate: (template: SignageTemplate) => void;
  /** 選択中のテンプレートID */
  selectedTemplateId?: string;
};

export const TemplateSelectorPresentation = ({
  templates,
  onSelectTemplate,
  selectedTemplateId,
}: TemplateSelectorPresentationProps): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SignageTemplate | null>(null);

  /**
   * テンプレート選択ハンドラー
   */
  const handleSelectTemplate = (template: SignageTemplate): void => {
    onSelectTemplate(template);
    setOpen(false);
  };

  /**
   * プレビュー表示
   */
  const handlePreview = (template: SignageTemplate, e: React.MouseEvent): void => {
    e.stopPropagation();
    setPreviewTemplate(template);
  };

  return (
    <>
      {/* テンプレート選択ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            テンプレートを選択
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>テンプレートを選択</DialogTitle>
            <DialogDescription>
              サイネージのレイアウトテンプレートを選択してください
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="min-h-0 flex-1 pr-4">
            <div className="grid grid-cols-2 gap-4 pb-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplateId === template.id ? "border-2 border-primary" : ""
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectTemplate(template);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={template.thumbnailUrl}
                        alt={template.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onError={(e) => {
                          // 画像読み込みエラー時のフォールバック
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      {/* 画像がない場合のプレースホルダー */}
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center text-gray-400">
                          <p className="text-sm">プレビュー</p>
                          <p className="text-xs">
                            {template.defaultLayout.grid.columns} ×{" "}
                            {template.defaultLayout.grid.rows} グリッド
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => handlePreview(template, e)}
                      >
                        詳細
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        選択
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* プレビューダイアログ */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>{previewTemplate.name}</DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
              {/* サムネイル */}
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={previewTemplate.thumbnailUrl}
                  alt={previewTemplate.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 75vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>

              {/* テンプレート詳細 */}
              <div className="space-y-2">
                <h3 className="font-semibold">レイアウト情報</h3>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>
                    グリッドサイズ: {previewTemplate.defaultLayout.grid.columns} ×{" "}
                    {previewTemplate.defaultLayout.grid.rows}
                  </li>
                  <li>アイテム数: {previewTemplate.defaultLayout.items.length}</li>
                  <li>
                    背景:{" "}
                    {previewTemplate.defaultLayout.background.type === "color" ? "単色" : "画像"}
                  </li>
                </ul>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex shrink-0 gap-2 border-t pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setPreviewTemplate(null)}>
                閉じる
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  handleSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                このテンプレートを使用
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
