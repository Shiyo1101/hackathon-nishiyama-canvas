import type { SerializedCanvas } from "@api";
import { EditIcon, EyeIcon, ImageOffIcon, PlusIcon, WallpaperIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MyCanvasSectionPresentationProps = {
  myCanvas: SerializedCanvas | null;
};

export const MyCanvasSectionPresentation = ({ myCanvas }: MyCanvasSectionPresentationProps) => {
  // 未作成の場合：作成ボタンのみ表示
  if (!myCanvas) {
    return (
      <section className="flex flex-col items-center justify-center gap-6">
        <Card className="w-full border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <WallpaperIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">キャンバスを作成しましょう!</CardTitle>
            <CardDescription className="text-base">
              あなただけのオリジナルキャンバスを作成して、レッサーパンダの魅力を発信しましょう。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/canvas/edit">
                <PlusIcon className="mr-2" />
                キャンバスを作成する
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // 作成済みの場合：プレビューと編集ボタン表示
  return (
    <section className="flex flex-col items-center gap-4">
      {/* サムネイル画像 */}
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-md ${!myCanvas.thumbnailUrl ? "border-2 border-muted-foreground/50 border-dashed bg-muted/20" : ""}`}
      >
        {myCanvas.thumbnailUrl ? (
          <Image
            className="object-cover"
            src={myCanvas.thumbnailUrl}
            alt={myCanvas.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <ImageOffIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">サムネイル未設定</p>
              <p className="text-muted-foreground text-xs">※編集画面の設定から追加してください</p>
            </div>
          </div>
        )}
      </div>

      {/* タイトルと説明 */}
      <div className="w-full space-y-2">
        <h2 className="font-bold text-2xl">{myCanvas.title}</h2>
        {myCanvas.description && <p className="text-muted-foreground">{myCanvas.description}</p>}
      </div>

      {/* 統計情報（公開済みの場合のみ表示） */}
      {myCanvas.isPublic && (
        <div className="flex w-full gap-4 rounded-md bg-muted p-4">
          <div className="flex-1 text-center">
            <div className="font-bold text-2xl">{myCanvas.viewCount.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">閲覧回数</div>
          </div>
          <div className="flex-1 text-center">
            <div className="font-bold text-2xl">{myCanvas.likeCount.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">お気に入り</div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex w-full gap-2">
        <Button asChild className="flex-1" variant="default">
          <Link href={`/canvas/preview`}>
            <EyeIcon />
            プレビュー
          </Link>
        </Button>
        <Button asChild className="flex-1" variant="secondary">
          <Link href="/canvas/edit">
            <EditIcon />
            編集する
          </Link>
        </Button>
      </div>
    </section>
  );
};
