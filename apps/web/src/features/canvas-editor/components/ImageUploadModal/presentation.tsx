/**
 * 画像アップロードモーダル - Presentation Component
 */
"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadUserImageAction } from "../../actions/canvas-actions";

type ImageUploadModalPresentationProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 閉じるボタンのハンドラー */
  onClose: () => void;
  /** アップロード成功時のコールバック */
  onUploadSuccess: (imageId: string) => void;
};

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ImageUploadModalPresentation = ({
  isOpen,
  onClose,
  onUploadSuccess,
}: ImageUploadModalPresentationProps): React.JSX.Element => {
  const fileInputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ファイルバリデーション
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "PNG、JPEG、JPG形式のファイルのみアップロードできます";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "ファイルサイズは10MB以下にしてください";
    }
    return null;
  }, []);

  // ファイル選択
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    },
    [validateFile],
  );

  // ファイルドロップ
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    },
    [validateFile],
  );

  // ドラッグオーバー
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  // ドラッグ離脱
  const handleDragLeave = useCallback((): void => {
    setIsDragging(false);
  }, []);

  // 画像クリア
  const handleClear = useCallback((): void => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  // アップロード
  const handleUpload = useCallback((): void => {
    if (!selectedFile) return;

    setError(null);

    startTransition(async () => {
      try {
        // FormDataを作成
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Server Actionを呼び出し
        const result = await uploadUserImageAction(formData);

        if (!result.success) {
          throw new Error(result.error);
        }

        // 成功時の処理
        toast.success("画像をアップロードしました");
        onUploadSuccess(result.imageId);
        handleClear();
        onClose();
      } catch (err) {
        console.error("Upload error:", err);
        const errorMessage = err instanceof Error ? err.message : "アップロードに失敗しました";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  }, [selectedFile, onUploadSuccess, onClose, handleClear]);

  // モーダルを閉じる際のクリーンアップ
  const handleClose = useCallback((): void => {
    handleClear();
    onClose();
  }, [handleClear, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>画像をアップロード</DialogTitle>
          <DialogDescription>
            PNG、JPEG、JPG形式の画像をアップロードできます（最大10MB）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ドラッグ&ドロップエリア */}
          {!previewUrl && (
            // biome-ignore lint/a11y/useSemanticElements: ドラッグ&ドロップ機能のためdivを使用
            <div
              role="button"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  document.getElementById(fileInputId)?.click();
                }
              }}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload className="mb-4 size-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-sm">
                画像をドラッグ&ドロップ、またはクリックして選択
              </p>
              <p className="mb-4 text-muted-foreground text-xs">PNG, JPEG, JPG (最大10MB)</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                id={fileInputId}
                disabled={isPending}
              />
              <label htmlFor={fileInputId}>
                <Button variant="secondary" asChild disabled={isPending}>
                  <span>ファイルを選択</span>
                </Button>
              </label>
            </div>
          )}

          {/* プレビューエリア */}
          {previewUrl && (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 600px"
                  unoptimized
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleClear}
                disabled={isPending}
              >
                <X className="size-4" />
              </Button>
              {selectedFile && (
                <p className="mt-2 text-muted-foreground text-sm">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">{error}</div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isPending}>
              {isPending ? "アップロード中..." : "アップロード"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
