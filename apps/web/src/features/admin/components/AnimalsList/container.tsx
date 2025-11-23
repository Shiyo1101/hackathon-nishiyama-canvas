"use client";

import type { Animal } from "@api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { AnimalsListPresentation } from "./presentation";

export const AnimalsListContainer = (): React.JSX.Element => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false);
  const [selectedAnimalForImages, setSelectedAnimalForImages] = useState<Animal | null>(null);

  const fetchAnimals = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.animals.$get({
        query: {},
      });

      if (!response.ok) {
        throw new Error("動物情報の取得に失敗しました");
      }

      const data = await response.json();
      setAnimals(data.data.animals);
    } catch (error) {
      console.error("動物情報取得エラー:", error);
      toast.error("動物情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchAnimals is stable
  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleCreate = () => {
    setEditingAnimal(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この動物情報を削除してもよろしいですか？")) {
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/animals/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("動物情報の削除に失敗しました");
      }

      toast.success("動物情報を削除しました");
      await fetchAnimals();
    } catch (error) {
      console.error("動物情報削除エラー:", error);
      toast.error("動物情報の削除に失敗しました");
    }
  };

  const handleDialogClose = (shouldRefresh?: boolean) => {
    setIsDialogOpen(false);
    setEditingAnimal(null);
    if (shouldRefresh) {
      fetchAnimals();
    }
  };

  const handleManageImages = (animal: Animal) => {
    setSelectedAnimalForImages(animal);
    setIsImagesDialogOpen(true);
  };

  const handleImagesDialogClose = () => {
    setIsImagesDialogOpen(false);
    setSelectedAnimalForImages(null);
  };

  return (
    <AnimalsListPresentation
      animals={animals}
      isLoading={isLoading}
      isDialogOpen={isDialogOpen}
      editingAnimal={editingAnimal}
      isImagesDialogOpen={isImagesDialogOpen}
      selectedAnimalForImages={selectedAnimalForImages}
      onCreateClick={handleCreate}
      onEditClick={handleEdit}
      onDeleteClick={handleDelete}
      onDialogClose={handleDialogClose}
      onManageImages={handleManageImages}
      onImagesDialogClose={handleImagesDialogClose}
    />
  );
};
