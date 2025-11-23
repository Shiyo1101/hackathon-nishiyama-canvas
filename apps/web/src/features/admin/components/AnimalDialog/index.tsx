"use client";

import type { Animal } from "@api";
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

type AnimalDialogProps = {
  open: boolean;
  animal: Animal | null;
  onClose: (shouldRefresh?: boolean) => void;
};

type FormData = {
  name: string;
  species: string;
  description: string;
  habitat: string;
  diet: string;
  status: "active" | "inactive";
};

export const AnimalDialog = ({ open, animal, onClose }: AnimalDialogProps): React.JSX.Element => {
  const nameId = useId();
  const speciesId = useId();
  const descriptionId = useId();
  const habitatId = useId();
  const dietId = useId();
  const statusId = useId();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    species: "",
    description: "",
    habitat: "",
    diet: "",
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (animal) {
        // 編集モード
        setFormData({
          name: animal.name,
          species: animal.species,
          description: animal.description ?? "",
          habitat: animal.habitat ?? "",
          diet: animal.diet ?? "",
          status: animal.status,
        });
      } else {
        // 新規作成モード
        setFormData({
          name: "",
          species: "",
          description: "",
          habitat: "",
          diet: "",
          status: "active",
        });
      }
    }
  }, [open, animal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.species.trim()) {
      toast.error("名前と種は必須です");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        species: formData.species,
        description: formData.description || undefined,
        habitat: formData.habitat || undefined,
        diet: formData.diet || undefined,
        status: formData.status,
      };

      if (animal) {
        // 更新
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/animals/${animal.id}`;
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("動物情報の更新に失敗しました");
        }

        toast.success("動物情報を更新しました");
      } else {
        // 新規作成
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/animals`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("動物情報の作成に失敗しました");
        }

        toast.success("動物情報を作成しました");
      }

      onClose(true);
    } catch (error) {
      console.error("動物情報保存エラー:", error);
      toast.error(animal ? "動物情報の更新に失敗しました" : "動物情報の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{animal ? "動物情報編集" : "動物情報新規作成"}</DialogTitle>
          <DialogDescription>
            {animal ? "動物情報を編集します" : "新しい動物情報を作成します"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>
                名前 <span className="text-destructive">*</span>
              </Label>
              <Input
                id={nameId}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例: レッサーパンダ"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={speciesId}>
                種 <span className="text-destructive">*</span>
              </Label>
              <Input
                id={speciesId}
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="例: Ailurus fulgens"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={descriptionId}>説明</Label>
            <Textarea
              id={descriptionId}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="動物の詳細説明"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={habitatId}>生息地</Label>
              <Input
                id={habitatId}
                name="habitat"
                value={formData.habitat}
                onChange={handleChange}
                placeholder="例: 中国南部、ヒマラヤ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={dietId}>食べ物</Label>
              <Input
                id={dietId}
                name="diet"
                value={formData.diet}
                onChange={handleChange}
                placeholder="例: 竹、果物"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={statusId}>ステータス</Label>
            <select
              id={statusId}
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">公開中</option>
              <option value="inactive">非公開</option>
            </select>
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
              {isSubmitting ? "保存中..." : animal ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
