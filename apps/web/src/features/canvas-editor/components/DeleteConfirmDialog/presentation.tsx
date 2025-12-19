/**
 * 削除確認ダイアログ - プレゼンテーションコンポーネント
 *
 * コンテンツアイテムを削除する前に確認を求めるダイアログ
 */
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteConfirmDialogPresentationProps = {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** 閉じる時のハンドラー */
  onClose: () => void;
  /** 削除確定時のハンドラー */
  onConfirm: () => void;
  /** 削除対象アイテムの説明（オプション） */
  itemDescription?: string;
};

export const DeleteConfirmDialogPresentation = ({
  isOpen,
  onClose,
  onConfirm,
  itemDescription = "このアイテム",
}: DeleteConfirmDialogPresentationProps): React.JSX.Element => {
  const handleConfirm = (): void => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>アイテムの削除</AlertDialogTitle>
          <AlertDialogDescription>
            {itemDescription}を削除しますか？
            <br />
            この操作は元に戻すことができます（Ctrl+Z）。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
