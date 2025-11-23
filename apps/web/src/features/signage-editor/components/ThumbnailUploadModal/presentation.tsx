/**
 * サムネイル画像アップロードモーダル - プレゼンテーションコンポーネント
 *
 * サイネージのサムネイル画像をアップロードするためのモーダル
 */
"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

type ThumbnailUploadModalPresentationProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 現在のサムネイルURL（プレビュー用） */
  currentThumbnailUrl?: string | null;
  /** モーダルを閉じる */
  onClose: () => void;
  /** アップロード成功時のコールバック */
  onUploadSuccess: (imageUrl: string) => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export const ThumbnailUploadModalPresentation = ({
  isOpen,
  currentThumbnailUrl,
  onClose,
  onUploadSuccess,
}: ThumbnailUploadModalPresentationProps): React.JSX.Element => {
  const fileInputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズは10MB以下にしてください");
      return;
    }

    // ファイル形式チェック
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("PNG、JPEG、JPG形式の画像を選択してください");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // プレビュー用URL生成
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // APIにアップロード
      // @ts-expect-error - uploadルートがapiClientの型に含まれていないため一時的に無視
      const response = await apiClient.upload.content.$post({
        form: {
          file: selectedFile,
        },
      });

      if (!response.ok) {
        throw new Error("アップロードに失敗しました");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "アップロードに失敗しました");
      }

      // 画像URLを取得
      const imageUrl = data.data.image.imageUrl;

      toast.success("サムネイル画像をアップロードしました");
      onUploadSuccess(imageUrl);
      handleClear();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "アップロードに失敗しました";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = (): void => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleClose = (): void => {
    if (!isUploading) {
      handleClear();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>サムネイル画像設定</DialogTitle>
          <DialogDescription>
            サイネージの一覧に表示されるサムネイル画像を設定します（PNG、JPEG、JPG / 10MB以下）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 現在のサムネイル表示 */}
          {currentThumbnailUrl && !previewUrl && (
            <div className="space-y-2">
              <Label>現在のサムネイル</Label>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image
                  src={currentThumbnailUrl}
                  alt="Current thumbnail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          )}

          {/* ファイル選択 */}
          <div className="space-y-2">
            <Label htmlFor={fileInputId}>新しい画像を選択</Label>
            <input
              id={fileInputId}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="w-full"
            />
          </div>

          {/* プレビュー */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>プレビュー</Label>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleClear} disabled={isUploading}>
                クリア
              </Button>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            <X className="mr-2 size-4" />
            キャンセル
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              "アップロード中..."
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                アップロード
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
