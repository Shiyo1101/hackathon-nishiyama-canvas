/**
 * テキスト入力モーダル - プレゼンテーションコンポーネント
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TextInputModalPresentationProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 初期テキスト */
  initialText?: string;
  /** 初期スタイル設定 */
  initialStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "center" | "bottom";
    rotation?: number;
    lineHeight?: string;
    letterSpacing?: string;
  };
  /** モーダルを閉じる */
  onClose: () => void;
  /** テキスト確定時のコールバック */
  onSubmit: (text: string, style?: TextInputModalPresentationProps["initialStyle"]) => void;
};

export const TextInputModalPresentation = ({
  isOpen,
  initialText = "",
  initialStyle,
  onClose,
  onSubmit,
}: TextInputModalPresentationProps): React.JSX.Element => {
  const textareaId = useId();
  const fontSizeId = useId();
  const fontWeightId = useId();
  const colorId = useId();
  const backgroundColorId = useId();
  const textAlignId = useId();
  const verticalAlignId = useId();
  const rotationId = useId();
  const lineHeightId = useId();
  const letterSpacingId = useId();

  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState(initialStyle || {});

  // モーダルを開く際に初期値を設定
  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setStyle(initialStyle || {});
    }
  }, [isOpen, initialText, initialStyle]);

  const handleSubmit = (): void => {
    if (text.trim()) {
      onSubmit(text, style);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>テキストを入力・編集</DialogTitle>
          <DialogDescription>表示するテキストとスタイルを設定してください</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* テキスト入力 */}
          <Field>
            <FieldLabel htmlFor={textareaId}>テキスト</FieldLabel>
            <Textarea
              id={textareaId}
              placeholder="テキストを入力してください"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </Field>

          {/* スタイル設定 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">スタイル設定</h3>

            {/* フォントサイズ・太さ */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={fontSizeId}>フォントサイズ</FieldLabel>
                <Select
                  value={style.fontSize || "16px"}
                  onValueChange={(value) => setStyle({ ...style, fontSize: value })}
                >
                  <SelectTrigger id={fontSizeId} className="w-full">
                    <SelectValue placeholder="フォントサイズを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">小 (12px)</SelectItem>
                    <SelectItem value="16px">中 (16px)</SelectItem>
                    <SelectItem value="24px">大 (24px)</SelectItem>
                    <SelectItem value="32px">特大 (32px)</SelectItem>
                    <SelectItem value="48px">超特大 (48px)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={fontWeightId}>太さ</FieldLabel>
                <Select
                  value={style.fontWeight || "normal"}
                  onValueChange={(value) => setStyle({ ...style, fontWeight: value })}
                >
                  <SelectTrigger id={fontWeightId} className="w-full">
                    <SelectValue placeholder="太さを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">通常</SelectItem>
                    <SelectItem value="bold">太字</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* 色設定 */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={colorId}>文字色</FieldLabel>
                <Input
                  id={colorId}
                  type="color"
                  value={style.color || "#000000"}
                  onChange={(e) => setStyle({ ...style, color: e.target.value })}
                  className="h-10 w-full cursor-pointer"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={backgroundColorId}>背景色</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id={backgroundColorId}
                    type="color"
                    value={style.backgroundColor || "#ffffff"}
                    onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                    className="h-10 w-full cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStyle({ ...style, backgroundColor: undefined })}
                  >
                    なし
                  </Button>
                </div>
              </Field>
            </div>

            {/* テキスト配置 */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={textAlignId}>横方向の配置</FieldLabel>
                <Select
                  value={style.textAlign || "center"}
                  onValueChange={(value) =>
                    setStyle({ ...style, textAlign: value as "left" | "center" | "right" })
                  }
                >
                  <SelectTrigger id={textAlignId} className="w-full">
                    <SelectValue placeholder="横方向の配置を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">左</SelectItem>
                    <SelectItem value="center">中央</SelectItem>
                    <SelectItem value="right">右</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={verticalAlignId}>縦方向の配置</FieldLabel>
                <Select
                  value={style.verticalAlign || "center"}
                  onValueChange={(value) =>
                    setStyle({
                      ...style,
                      verticalAlign: value as "top" | "center" | "bottom",
                    })
                  }
                >
                  <SelectTrigger id={verticalAlignId} className="w-full">
                    <SelectValue placeholder="縦方向の配置を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">上</SelectItem>
                    <SelectItem value="center">中央</SelectItem>
                    <SelectItem value="bottom">下</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* 回転角度 */}
            <Field>
              <FieldLabel htmlFor={rotationId}>回転角度: {style.rotation || 0}°</FieldLabel>
              <Input
                id={rotationId}
                type="range"
                min="-180"
                max="180"
                value={style.rotation || 0}
                onChange={(e) => setStyle({ ...style, rotation: Number(e.target.value) })}
                className="w-full"
              />
            </Field>

            {/* 行の高さ・文字間隔 */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={lineHeightId}>行の高さ</FieldLabel>
                <Select
                  value={style.lineHeight || "1.5"}
                  onValueChange={(value) => setStyle({ ...style, lineHeight: value })}
                >
                  <SelectTrigger id={lineHeightId} className="w-full">
                    <SelectValue placeholder="行の高さを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">狭い (1.0)</SelectItem>
                    <SelectItem value="1.5">通常 (1.5)</SelectItem>
                    <SelectItem value="2">広い (2.0)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={letterSpacingId}>文字間隔</FieldLabel>
                <Select
                  value={style.letterSpacing || "normal"}
                  onValueChange={(value) => setStyle({ ...style, letterSpacing: value })}
                >
                  <SelectTrigger id={letterSpacingId} className="w-full">
                    <SelectValue placeholder="文字間隔を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">通常</SelectItem>
                    <SelectItem value="0.05em">広い</SelectItem>
                    <SelectItem value="0.1em">とても広い</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 size-4" />
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!text.trim()}>
            <Check className="mr-2 size-4" />
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
