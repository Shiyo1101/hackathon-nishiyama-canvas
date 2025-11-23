"use client";

import type { Animal, AnimalImage } from "@api";
import { ImageIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AnimalImagesDialogProps = {
  open: boolean;
  animal: Animal | null;
  onClose: () => void;
};

type ImageFormData = {
  file: File | null;
  caption: string;
  isFeatured: boolean;
};

export const AnimalImagesDialog = ({
  open,
  animal,
  onClose,
}: AnimalImagesDialogProps): React.JSX.Element => {
  const imageFileId = useId();
  const captionId = useId();
  const isFeaturedId = useId();

  const [images, setImages] = useState<AnimalImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<ImageFormData>({
    file: null,
    caption: "",
    isFeatured: false,
  });

  const fetchImages = useCallback(async () => {
    if (!animal) return;

    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/animals/${animal.id}/images`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("画像の取得に失敗しました");
      }

      const data = await response.json();
      setImages(data.data.images);
    } catch (error) {
      console.error("画像取得エラー:", error);
      toast.error("画像の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [animal]);

  // 画像一覧を取得
  useEffect(() => {
    if (open && animal) {
      fetchImages();
    } else {
      // ダイアログを閉じたらリセット
      setImages([]);
      setPreviewUrl(null);
      setFormData({ file: null, caption: "", isFeatured: false });
    }
  }, [open, animal, fetchImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ファイルサイズは10MB以下にしてください");
      return;
    }

    // ファイル形式チェック
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("PNG、JPEG、JPG形式の画像のみアップロード可能です");
      return;
    }

    setFormData({ ...formData, file });

    // プレビュー画像を生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!animal || !formData.file) {
      toast.error("画像を選択してください");
      return;
    }

    try {
      setIsUploading(true);

      // 画像をBase64に変換
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/admin/animals/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            animalId: animal.id,
            imageUrl: base64Image,
            caption: formData.caption || null,
            isFeatured: formData.isFeatured,
          }),
        });

        if (!response.ok) {
          throw new Error("画像のアップロードに失敗しました");
        }

        toast.success("画像をアップロードしました");
        setFormData({ file: null, caption: "", isFeatured: false });
        setPreviewUrl(null);
        await fetchImages();
      };

      reader.readAsDataURL(formData.file);
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      toast.error("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("この画像を削除してもよろしいですか?")) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/admin/animals/images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("画像の削除に失敗しました");
      }

      toast.success("画像を削除しました");
      await fetchImages();
    } catch (error) {
      console.error("画像削除エラー:", error);
      toast.error("画像の削除に失敗しました");
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setFormData({ file: null, caption: "", isFeatured: false });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{animal?.name} の画像管理</DialogTitle>
          <DialogDescription>
            動物の画像をアップロード・管理できます（最大10MB、PNG/JPEG/JPG形式）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* アップロードフォーム */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-sm">新しい画像をアップロード</h3>

            <div className="space-y-2">
              <Label htmlFor={imageFileId}>画像ファイル</Label>
              <Input
                id={imageFileId}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>

            {previewUrl && (
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="プレビュー"
                  width={800}
                  height={256}
                  className="max-h-64 w-full rounded-lg border object-contain"
                  unoptimized
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearPreview}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={captionId}>キャプション（任意）</Label>
              <Textarea
                id={captionId}
                placeholder="画像の説明を入力"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                disabled={isUploading}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id={isFeaturedId}
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                disabled={isUploading}
                className="h-4 w-4"
              />
              <Label htmlFor={isFeaturedId} className="cursor-pointer">
                注目画像として設定
              </Label>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!formData.file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                "アップロード中..."
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  アップロード
                </>
              )}
            </Button>
          </div>

          {/* 画像一覧 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">登録済み画像 ({images.length}件)</h3>

            {isLoading ? (
              <p className="py-8 text-center text-muted-foreground text-sm">読み込み中...</p>
            ) : images.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground text-sm">画像がまだ登録されていません</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                    <Image
                      src={image.imageUrl}
                      alt={image.caption || "動物画像"}
                      width={400}
                      height={192}
                      className="h-48 w-full object-cover"
                      unoptimized
                    />
                    {image.isFeatured && (
                      <div className="absolute top-2 left-2 rounded bg-primary px-2 py-1 text-primary-foreground text-xs">
                        注目
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                    {image.caption && (
                      <div className="bg-background/90 p-2 text-xs">
                        <p className="line-clamp-2">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
