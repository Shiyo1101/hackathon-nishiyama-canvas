import type { Animal } from "@api";
import { format } from "date-fns";
import { Edit2Icon, ImageIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimalDialog } from "../AnimalDialog";
import { AnimalImagesDialog } from "../AnimalImagesDialog";

type AnimalsListPresentationProps = {
  animals: Animal[];
  isLoading: boolean;
  isDialogOpen: boolean;
  editingAnimal: Animal | null;
  isImagesDialogOpen: boolean;
  selectedAnimalForImages: Animal | null;
  onCreateClick: () => void;
  onEditClick: (animal: Animal) => void;
  onDeleteClick: (id: string) => void;
  onDialogClose: (shouldRefresh?: boolean) => void;
  onManageImages: (animal: Animal) => void;
  onImagesDialogClose: () => void;
};

export const AnimalsListPresentation = ({
  animals,
  isLoading,
  isDialogOpen,
  editingAnimal,
  isImagesDialogOpen,
  selectedAnimalForImages,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onDialogClose,
  onManageImages,
  onImagesDialogClose,
}: AnimalsListPresentationProps): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">全 {animals.length} 件の動物情報</p>
        <Button onClick={onCreateClick}>
          <PlusIcon className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>種</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : animals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  動物情報がありません
                </TableCell>
              </TableRow>
            ) : (
              animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{animal.name}</span>
                      {animal.description && (
                        <span className="line-clamp-1 text-muted-foreground text-xs">
                          {animal.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{animal.species}</TableCell>
                  <TableCell>
                    <Badge variant={animal.status === "active" ? "default" : "secondary"}>
                      {animal.status === "active" ? "公開中" : "非公開"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(animal.createdAt), "yyyy/MM/dd HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onManageImages(animal)}
                        title="画像管理"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditClick(animal)}>
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteClick(animal.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AnimalDialog open={isDialogOpen} animal={editingAnimal} onClose={onDialogClose} />
      <AnimalImagesDialog
        open={isImagesDialogOpen}
        animal={selectedAnimalForImages}
        onClose={onImagesDialogClose}
      />
    </div>
  );
};
