"use client";

import type { News } from "@api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { NewsListPresentation } from "./presentation";

export const NewsListContainer = (): React.JSX.Element => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.news.$get({
        query: {
          limit: "100",
          offset: "0",
        },
      });

      if (!response.ok) {
        throw new Error("ニュースの取得に失敗しました");
      }

      const data = await response.json();
      setNews(data.data.news);
    } catch (error) {
      console.error("ニュース取得エラー:", error);
      toast.error("ニュースの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchNews is stable
  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreate = () => {
    setEditingNews(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このニュースを削除してもよろしいですか？")) {
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/news/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("ニュースの削除に失敗しました");
      }

      toast.success("ニュースを削除しました");
      await fetchNews();
    } catch (error) {
      console.error("ニュース削除エラー:", error);
      toast.error("ニュースの削除に失敗しました");
    }
  };

  const handleDialogClose = (shouldRefresh?: boolean) => {
    setIsDialogOpen(false);
    setEditingNews(null);
    if (shouldRefresh) {
      fetchNews();
    }
  };

  return (
    <NewsListPresentation
      news={news}
      isLoading={isLoading}
      isDialogOpen={isDialogOpen}
      editingNews={editingNews}
      onCreateClick={handleCreate}
      onEditClick={handleEdit}
      onDeleteClick={handleDelete}
      onDialogClose={handleDialogClose}
    />
  );
};
