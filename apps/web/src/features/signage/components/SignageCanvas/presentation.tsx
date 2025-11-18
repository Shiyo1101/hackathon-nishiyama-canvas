import type { SerializedSignage } from "@api";
import { EditIcon, EyeIcon, PlusIcon, WallpaperIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SignageCanvasPresentationProps = {
  mySignage: SerializedSignage | null;
};

export const SignageCanvasPresentation = ({ mySignage }: SignageCanvasPresentationProps) => {
  // 未作成の場合：作成ボタンのみ表示
  if (!mySignage) {
    return (
      <section className="flex flex-col items-center justify-center gap-6">
        <Card className="w-full border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <WallpaperIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">サイネージを作成しましょう!</CardTitle>
            <CardDescription className="text-base">
              あなただけのオリジナルサイネージを作成して、レッサーパンダの魅力を発信しましょう。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/signage/edit">
                <PlusIcon className="mr-2" />
                サイネージを作成する
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
      {mySignage.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <Image
            className="object-cover"
            src={mySignage.thumbnailUrl}
            alt={mySignage.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

      {/* タイトルと説明 */}
      <div className="w-full space-y-2">
        <h2 className="font-bold text-2xl">{mySignage.title}</h2>
        {mySignage.description && <p className="text-muted-foreground">{mySignage.description}</p>}
      </div>

      {/* 統計情報（公開済みの場合のみ表示） */}
      {mySignage.isPublic && (
        <div className="flex w-full gap-4 rounded-md bg-muted p-4">
          <div className="flex-1 text-center">
            <div className="font-bold text-2xl">{mySignage.viewCount.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">閲覧回数</div>
          </div>
          <div className="flex-1 text-center">
            <div className="font-bold text-2xl">{mySignage.likeCount.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">お気に入り</div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex w-full gap-2">
        <Button asChild className="flex-1" variant="default">
          <Link href={`/signage/${mySignage.slug}`}>
            <EyeIcon />
            プレビュー
          </Link>
        </Button>
        <Button asChild className="flex-1" variant="secondary">
          <Link href="/signage/edit">
            <EditIcon />
            編集する
          </Link>
        </Button>
      </div>
    </section>
  );
};
