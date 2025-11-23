import type { News } from "@api";
import { format } from "date-fns";
import { Edit2Icon, PlusIcon, TrashIcon } from "lucide-react";
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
import { NewsDialog } from "../NewsDialog";

type NewsListPresentationProps = {
  news: News[];
  isLoading: boolean;
  isDialogOpen: boolean;
  editingNews: News | null;
  onCreateClick: () => void;
  onEditClick: (news: News) => void;
  onDeleteClick: (id: string) => void;
  onDialogClose: (shouldRefresh?: boolean) => void;
};

export const NewsListPresentation = ({
  news,
  isLoading,
  isDialogOpen,
  editingNews,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onDialogClose,
}: NewsListPresentationProps): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">全 {news.length} 件のニュース</p>
        <Button onClick={onCreateClick}>
          <PlusIcon className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>公開日</TableHead>
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
            ) : news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  ニュースがありません
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{item.title}</span>
                      {item.summary && (
                        <span className="line-clamp-1 text-muted-foreground text-xs">
                          {item.summary}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.category && <Badge variant="secondary">{item.category}</Badge>}
                  </TableCell>
                  <TableCell>
                    {item.publishedAt
                      ? format(new Date(item.publishedAt), "yyyy/MM/dd HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>{format(new Date(item.createdAt), "yyyy/MM/dd HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEditClick(item)}>
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteClick(item.id)}>
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

      <NewsDialog open={isDialogOpen} news={editingNews} onClose={onDialogClose} />
    </div>
  );
};
