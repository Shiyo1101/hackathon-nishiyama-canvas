/**
 * エディターキャンバス - プレゼンテーションコンポーネント
 *
 * 右側のメインエリアに表示され、サイネージのプレビューと編集を行う
 * 状態管理とイベントハンドリングを含むClient Component
 */
"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Check, Eye, Globe, ImageIcon, Lock, Save, Settings2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { ContentItemType, LayoutItem } from "@/types";
import { updateSignageAction } from "../../actions/signage-actions";
import { useHistory } from "../../hooks";
import {
  hasUnsavedChangesAtom,
  initialLayoutConfigAtom,
  isPublicAtom,
  isSavingAtom,
  layoutConfigAtom,
  pendingEditItemIdAtom,
  removeLayoutItemAtom,
  selectedItemIdAtom,
  signageDescriptionAtom,
  signageIdAtom,
  signageTitleAtom,
  thumbnailUrlAtom,
  updateLayoutItemAtom,
} from "../../store/atoms";
import { validateLayout } from "../../utils/validation";
import { ContentSelectionModal } from "../ContentSelectionModal";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { DraggableGridCanvas } from "../DraggableGridCanvas";
import { ImageUploadModal } from "../ImageUploadModal";
import { ItemSettingsModal } from "../ItemSettingsModal";
import { TextInputModal } from "../TextInputModal";
import { ThumbnailUploadModal } from "../ThumbnailUploadModal";
import { UndoRedoButtons } from "../UndoRedoButtons";

type EditorCanvasPresentationProps = {
  /** 保存成功時のコールバック */
  onSaveSuccess?: () => void;
};

export const EditorCanvasPresentation = ({
  onSaveSuccess,
}: EditorCanvasPresentationProps): React.JSX.Element => {
  const router = useRouter();
  const layout = useAtomValue(layoutConfigAtom);
  const [isSaving, setIsSaving] = useAtom(isSavingAtom);
  const signageId = useAtomValue(signageIdAtom);
  const [title, setTitle] = useAtom(signageTitleAtom);
  const [description, setDescription] = useAtom(signageDescriptionAtom);
  const [isPublic, setIsPublic] = useAtom(isPublicAtom);
  const [thumbnailUrl, setThumbnailUrl] = useAtom(thumbnailUrlAtom);
  const removeLayoutItem = useSetAtom(removeLayoutItemAtom);
  const updateLayoutItem = useSetAtom(updateLayoutItemAtom);
  const setSelectedItemId = useSetAtom(selectedItemIdAtom);
  const setInitialLayoutConfig = useSetAtom(initialLayoutConfigAtom);
  const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);
  const [pendingEditItemId, setPendingEditItemId] = useAtom(pendingEditItemIdAtom);
  const { pushHistory } = useHistory();

  // 削除確認ダイアログの状態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // プレビュー遷移確認ダイアログの状態
  const [isPreviewConfirmDialogOpen, setIsPreviewConfirmDialogOpen] = useState(false);

  // 編集モーダルの状態
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isItemSettingsModalOpen, setIsItemSettingsModalOpen] = useState(false);
  const [initialEditText, setInitialEditText] = useState("");
  const [initialEditStyle, setInitialEditStyle] = useState<{
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "center" | "bottom";
    rotation?: number;
    lineHeight?: string;
    letterSpacing?: string;
  }>();
  const [selectedContentType, setSelectedContentType] = useState<ContentItemType | null>(null);
  const [isEditingSlideshow, setIsEditingSlideshow] = useState(false);
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 一意なID生成
  const signageTitleId = useId();
  const signageDescriptionId = useId();
  const publicOptionId = useId();
  const privateOptionId = useId();

  /**
   * アイテムクリックハンドラー
   */
  const handleItemClick = (itemId: string): void => {
    setSelectedItemId(itemId);
  };

  /**
   * アイテム削除ハンドラー（ダイアログを開く）
   */
  const handleItemDelete = (itemId: string): void => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  /**
   * アイテム編集ハンドラー
   */
  const handleItemEdit = useCallback(
    (itemId: string): void => {
      if (!layout) return;

      const item = layout.items.find((i) => i.id === itemId);
      if (!item) return;

      // アイテムを選択状態にする
      setSelectedItemId(itemId);
      setEditingItemId(itemId);

      // アイテムタイプに応じた編集モーダルを開く
      switch (item.type) {
        case "text":
          // TextInputModalを開く(既存テキストとスタイルを渡す)
          setInitialEditText(item.textContent || "");
          setInitialEditStyle(item.style);
          setIsTextModalOpen(true);
          break;

        case "user_image":
          // ImageUploadModalを開く
          setIsImageUploadModalOpen(true);
          break;

        case "news":
          // ContentSelectionModalを開く(追加時と共通化)
          setSelectedContentType(item.type);
          setIsEditingSlideshow(false);
          setIsContentModalOpen(true);
          break;

        case "animal": {
          // スライドショー(contentIds)か単一画像(contentId)かを判定
          const isSlideshow = !!(item.contentIds && item.contentIds.length > 0);
          setSelectedContentType(item.type);
          setIsEditingSlideshow(isSlideshow);
          setIsContentModalOpen(true);
          break;
        }

        case "timer":
          // タイマーは専用のItemSettingsModalを使用
          setIsItemSettingsModalOpen(true);
          break;

        case "weather":
          // 天気は設定不可
          toast.info("天気情報アイテムには編集可能な設定がありません");
          break;

        default:
          toast.error(`${item.type}タイプの編集はサポートされていません`);
      }
    },
    [layout, setSelectedItemId],
  );

  /**
   * タイマー追加後の編集モーダル自動表示
   */
  useEffect(() => {
    if (pendingEditItemId) {
      handleItemEdit(pendingEditItemId);
      setPendingEditItemId(null);
    }
  }, [pendingEditItemId, handleItemEdit, setPendingEditItemId]);

  /**
   * 削除確定ハンドラー
   */
  const handleDeleteConfirm = (): void => {
    if (itemToDelete) {
      // 削除前に現在の状態を履歴に保存
      pushHistory();
      removeLayoutItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  /**
   * 削除ダイアログを閉じる
   */
  const handleDeleteCancel = (): void => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  /**
   * テキスト編集モーダル - 確定ハンドラー
   */
  const handleTextEditSubmit = (
    text: string,
    style?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      backgroundColor?: string;
      textAlign?: "left" | "center" | "right";
      verticalAlign?: "top" | "center" | "bottom";
      rotation?: number;
      lineHeight?: string;
      letterSpacing?: string;
    },
  ): void => {
    if (!editingItemId || !layout) return;

    const item = layout.items.find((i) => i.id === editingItemId);
    if (!item) return;

    // 編集前に履歴に保存
    pushHistory();

    // アイテムを更新
    updateLayoutItem({
      ...item,
      textContent: text,
      style,
    });

    // モーダルを閉じる
    setIsTextModalOpen(false);
    setEditingItemId(null);
    setInitialEditText("");
    setInitialEditStyle(undefined);
    toast.success("テキストを更新しました");
  };

  /**
   * テキスト編集モーダル - 閉じるハンドラー
   */
  const handleTextEditClose = (): void => {
    setIsTextModalOpen(false);
    setEditingItemId(null);
    setInitialEditText("");
  };

  /**
   * 画像アップロードモーダル - 成功ハンドラー
   */
  const handleImageEditSuccess = (imageId: string): void => {
    if (!editingItemId || !layout) return;

    const item = layout.items.find((i) => i.id === editingItemId);
    if (!item) return;

    // 編集前に履歴に保存
    pushHistory();

    // アイテムを更新
    updateLayoutItem({
      ...item,
      contentId: imageId,
    });

    // モーダルを閉じる
    setIsImageUploadModalOpen(false);
    setEditingItemId(null);
    toast.success("画像を更新しました");
  };

  /**
   * サムネイルアップロード成功ハンドラー
   */
  const handleThumbnailUploadSuccess = (imageUrl: string): void => {
    setThumbnailUrl(imageUrl);
    toast.success("サムネイル画像を設定しました");
  };

  /**
   * 設定更新ハンドラー（タイトル、説明、サムネイル、公開設定のみ）
   */
  const handleUpdateSettings = async (): Promise<void> => {
    if (!signageId) {
      toast.error("サイネージIDが見つかりません");
      return;
    }

    try {
      setIsSaving(true);

      // Server Actionを呼び出し（設定のみ更新）
      const result = await updateSignageAction(signageId, {
        title,
        description: description || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        isPublic,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("設定を保存しました");
      onSaveSuccess?.();
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(
        `設定の保存に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 画像アップロードモーダル - 閉じるハンドラー
   */
  const handleImageEditClose = (): void => {
    setIsImageUploadModalOpen(false);
    setEditingItemId(null);
  };

  /**
   * コンテンツ選択モーダル - 確定ハンドラー
   */
  const handleContentEditSelect = (contentId: string, contentType: ContentItemType): void => {
    if (!editingItemId || !layout) return;

    const item = layout.items.find((i) => i.id === editingItemId);
    if (!item) return;

    // 編集前に履歴に保存
    pushHistory();

    // アイテムを更新
    updateLayoutItem({
      ...item,
      contentId,
      type: contentType,
    });

    // モーダルを閉じる
    setIsContentModalOpen(false);
    setEditingItemId(null);
    setSelectedContentType(null);
    toast.success("コンテンツを更新しました");
  };

  /**
   * コンテンツ選択モーダル（複数選択） - 確定ハンドラー
   */
  const handleContentsEditSelect = (contentIds: string[], contentType: ContentItemType): void => {
    if (!editingItemId || !layout) return;

    const item = layout.items.find((i) => i.id === editingItemId);
    if (!item) return;

    // 編集前に履歴に保存
    pushHistory();

    // アイテムを更新（スライドショー）
    updateLayoutItem({
      ...item,
      contentIds,
      contentId: undefined, // 単一contentIdをクリア
      slideshowInterval: item.slideshowInterval || 5000,
      type: contentType,
    });

    // モーダルを閉じる
    setIsContentModalOpen(false);
    setEditingItemId(null);
    setSelectedContentType(null);
    toast.success("スライドショーを更新しました");
  };

  /**
   * コンテンツ選択モーダル - 閉じるハンドラー
   */
  const handleContentEditClose = (): void => {
    setIsContentModalOpen(false);
    setEditingItemId(null);
    setSelectedContentType(null);
    setIsEditingSlideshow(false);
  };

  /**
   * アイテム設定モーダル - 保存ハンドラー
   */
  const handleItemSettingsSave = (updatedItem: Partial<LayoutItem>): void => {
    if (!editingItemId || !layout) return;

    const item = layout.items.find((i) => i.id === editingItemId);
    if (!item) return;

    // 編集前に履歴に保存
    pushHistory();

    // アイテムを更新
    updateLayoutItem({
      ...item,
      ...updatedItem,
    });

    // モーダルを閉じる
    setIsItemSettingsModalOpen(false);
    setEditingItemId(null);
    toast.success("設定を更新しました");
  };

  /**
   * アイテム設定モーダル - 閉じるハンドラー
   */
  const handleItemSettingsClose = (): void => {
    setIsItemSettingsModalOpen(false);
    setEditingItemId(null);
  };

  /**
   * 保存ハンドラー（Server Actionを使用）
   */
  const handleSave = async (): Promise<void> => {
    if (!layout || !signageId) {
      toast.error("レイアウト情報が見つかりません");
      return;
    }

    // バリデーションを実行
    const validationResult = validateLayout(layout.items, layout.grid);

    if (!validationResult.isValid) {
      // バリデーションエラーを表示
      const { overlapping, outOfBounds } = validationResult.errors;

      if (overlapping.length > 0) {
        toast.error(
          `コンテンツが重なっています（${overlapping.length}件）。アイテムの位置を調整してください。`,
          { duration: 5000 },
        );
      }

      if (outOfBounds.length > 0) {
        toast.error(
          `グリッド範囲外のアイテムがあります（${outOfBounds.length}件）。アイテムをグリッド内に移動してください。`,
          { duration: 5000 },
        );
      }

      return;
    }

    try {
      setIsSaving(true);

      // Server Actionを呼び出し
      const result = await updateSignageAction(signageId, {
        title,
        description: description || undefined,
        layoutConfig: layout,
        thumbnailUrl: thumbnailUrl || undefined,
        isPublic,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("サイネージを保存しました");
      // 保存成功時に初期レイアウトを更新（未保存変更フラグをリセット）
      setInitialLayoutConfig(layout);
      onSaveSuccess?.();
    } catch (error) {
      console.error("Failed to save signage:", error);
      toast.error(`保存に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * プレビューハンドラー（変更検知付き）
   */
  const handlePreview = (): void => {
    if (hasUnsavedChanges) {
      setIsPreviewConfirmDialogOpen(true);
    } else {
      router.push("/signage/preview");
    }
  };

  /**
   * プレビュー確認ダイアログ - 確定ハンドラー（変更を破棄してプレビューへ）
   */
  const handlePreviewConfirm = (): void => {
    setIsPreviewConfirmDialogOpen(false);
    router.push("/signage/preview");
  };

  /**
   * プレビュー確認ダイアログ - キャンセルハンドラー
   */
  const handlePreviewCancel = (): void => {
    setIsPreviewConfirmDialogOpen(false);
  };

  if (!layout) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-current border-r-transparent border-solid" />
          <p className="text-muted-foreground">レイアウトを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4">
        <h2 className="font-semibold text-lg">サイネージキャンバス</h2>
        <div className="flex items-center gap-2">
          {/* 設定切り替え */}
          <Button
            size="sm"
            variant={showSettings ? "default" : "outline"}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="size-4" />
            設定
          </Button>

          {/* Undo/Redo */}
          <UndoRedoButtons />

          {/* プレビュー */}
          <Button size="sm" variant="outline" onClick={handlePreview}>
            <Eye className="size-4" />
            プレビュー
          </Button>

          {/* 保存 */}
          <Button size="sm" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            <Save className="size-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </CardHeader>

      {/* 設定セクション */}
      {showSettings && (
        <div className="border-b px-6 py-4">
          <Card>
            <div className="space-y-6 p-6">
              {/* タイトル */}
              <div className="space-y-2">
                <Label htmlFor={signageTitleId}>タイトル</Label>
                <Input
                  id={signageTitleId}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="サイネージのタイトルを入力"
                  maxLength={255}
                />
              </div>

              {/* 説明 */}
              <div className="space-y-2">
                <Label htmlFor={signageDescriptionId}>説明（任意）</Label>
                <Textarea
                  id={signageDescriptionId}
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="サイネージの説明を入力"
                  maxLength={1000}
                  rows={3}
                />
              </div>

              {/* サムネイル画像 */}
              <div className="space-y-2">
                <Label>サムネイル画像</Label>
                {thumbnailUrl && (
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
                    <Image
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}
                <Button variant="outline" onClick={() => setIsThumbnailModalOpen(true)}>
                  <ImageIcon className="mr-2 size-4" />
                  {thumbnailUrl ? "サムネイルを変更" : "サムネイルを設定"}
                </Button>
              </div>

              {/* 公開設定 */}
              <div className="space-y-3">
                <Label className="font-semibold text-base">公開設定</Label>
                <RadioGroup
                  value={isPublic ? "public" : "private"}
                  onValueChange={(value) => setIsPublic(value === "public")}
                  className="space-y-3"
                >
                  {/* 公開 */}
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value="public" id={publicOptionId} />
                    <Label
                      htmlFor={publicOptionId}
                      className="flex flex-1 cursor-pointer items-start gap-3"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Globe className="size-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">公開</div>
                        <div className="text-muted-foreground text-sm">
                          誰でもこのサイネージを閲覧できます
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* 非公開 */}
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value="private" id={privateOptionId} />
                    <Label
                      htmlFor={privateOptionId}
                      className="flex flex-1 cursor-pointer items-start gap-3"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                        <Lock className="size-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">非公開</div>
                        <div className="text-muted-foreground text-sm">
                          あなただけがこのサイネージを閲覧できます
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleUpdateSettings} disabled={isSaving}>
                  <Check className="mr-2 size-4" />
                  {isSaving ? "保存中..." : "設定を保存"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <CardContent className="flex-1 overflow-auto p-6">
        {/* ドラッグ&ドロップ可能なグリッドキャンバス */}
        <DraggableGridCanvas
          onItemClick={handleItemClick}
          onItemDelete={handleItemDelete}
          onItemEdit={handleItemEdit}
        />
      </CardContent>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {/* プレビュー遷移確認ダイアログ */}
      <AlertDialog open={isPreviewConfirmDialogOpen} onOpenChange={setIsPreviewConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>未保存の変更があります</AlertDialogTitle>
            <AlertDialogDescription>
              配置コンテンツに未保存の変更があります。変更を破棄してプレビュー画面に移動しますか?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePreviewCancel}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handlePreviewConfirm}>変更を破棄して移動</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* テキスト編集モーダル */}
      <TextInputModal
        isOpen={isTextModalOpen}
        initialText={initialEditText}
        initialStyle={initialEditStyle}
        onClose={handleTextEditClose}
        onSubmit={handleTextEditSubmit}
      />

      {/* 画像アップロードモーダル */}
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={handleImageEditClose}
        onUploadSuccess={handleImageEditSuccess}
      />

      {/* コンテンツ選択モーダル */}
      <ContentSelectionModal
        isOpen={isContentModalOpen}
        contentType={selectedContentType}
        onClose={handleContentEditClose}
        onSelectContent={handleContentEditSelect}
        onSelectContents={handleContentsEditSelect}
        enableMultiSelect={isEditingSlideshow}
      />

      {/* アイテム設定モーダル */}
      <ItemSettingsModal
        isOpen={isItemSettingsModalOpen}
        item={editingItemId ? layout?.items.find((i) => i.id === editingItemId) || null : null}
        onClose={handleItemSettingsClose}
        onSave={handleItemSettingsSave}
      />

      {/* サムネイルアップロードモーダル */}
      <ThumbnailUploadModal
        isOpen={isThumbnailModalOpen}
        currentThumbnailUrl={thumbnailUrl}
        onClose={() => setIsThumbnailModalOpen(false)}
        onUploadSuccess={handleThumbnailUploadSuccess}
      />
    </>
  );
};
