"use client";

import type { News } from "@api";
import { useEffect, useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type NewsDialogProps = {
  open: boolean;
  news: News | null;
  onClose: (shouldRefresh?: boolean) => void;
};

type FormData = {
  title: string;
  content: string;
  summary: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
};

export const NewsDialog = ({ open, news, onClose }: NewsDialogProps): React.JSX.Element => {
  const titleId = useId();
  const contentId = useId();
  const summaryId = useId();
  const categoryId = useId();
  const publishedAtId = useId();
  const imageUrlId = useId();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    summary: "",
    category: "",
    imageUrl: "",
    publishedAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (news) {
        // 編集モード
        setFormData({
          title: news.title,
          content: news.content,
          summary: news.summary ?? "",
          category: news.category ?? "",
          imageUrl: news.imageUrl ?? "",
          publishedAt: news.publishedAt
            ? new Date(news.publishedAt).toISOString().slice(0, 16)
            : "",
        });
      } else {
        // 新規作成モード
        setFormData({
          title: "",
          content: "",
          summary: "",
          category: "",
          imageUrl: "",
          publishedAt: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [open, news]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("タイトルと本文は必須です");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || undefined,
        category: formData.category || undefined,
        imageUrl: formData.imageUrl || undefined,
        publishedAt: formData.publishedAt
          ? new Date(formData.publishedAt).toISOString()
          : undefined,
      };

      if (news) {
        // 更新
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/news/${news.id}`;
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("ニュースの更新に失敗しました");
        }

        toast.success("ニュースを更新しました");
      } else {
        // 新規作成
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/news`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("ニュースの作成に失敗しました");
        }

        toast.success("ニュースを作成しました");
      }

      onClose(true);
    } catch (error) {
      console.error("ニュース保存エラー:", error);
      toast.error(news ? "ニュースの更新に失敗しました" : "ニュースの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{news ? "ニュース編集" : "ニュース新規作成"}</DialogTitle>
          <DialogDescription>
            {news ? "ニュース情報を編集します" : "新しいニュースを作成します"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={titleId}>
              タイトル <span className="text-destructive">*</span>
            </Label>
            <Input
              id={titleId}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="ニュースのタイトルを入力"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={contentId}>
              本文 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={contentId}
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="ニュースの本文を入力"
              required
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={summaryId}>概要</Label>
            <Textarea
              id={summaryId}
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="ニュースの概要（任意）"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={categoryId}>カテゴリ</Label>
              <Input
                id={categoryId}
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="例: お知らせ、イベント"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={publishedAtId}>公開日時</Label>
              <Input
                id={publishedAtId}
                name="publishedAt"
                type="datetime-local"
                value={formData.publishedAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={imageUrlId}>画像URL</Label>
            <Input
              id={imageUrlId}
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : news ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
