import type { SerializedCanvas } from "@api";
import { Heart, HeartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FavoriteCanvasListPresentationProps = {
  canvases: SerializedCanvas[];
};

export const FavoriteCanvasListPresentation = ({
  canvases,
}: FavoriteCanvasListPresentationProps) => {
  // キャンバスが一つもない場合
  if (canvases.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Card className="w-full border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">お気に入りはまだありません</CardTitle>
            <CardDescription>
              気に入ったキャンバスを見つけたら、ハートボタンでお気に入りに追加できます。
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  // キャンバスがある場合
  return (
    <section className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
        <h2 className="font-bold text-xl">お気に入りのキャンバス</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canvases.map((canvas) => (
          <Link key={canvas.id} href={`/canvas/${canvas.slug}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              {/* サムネイル画像 */}
              {canvas.thumbnailUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={canvas.thumbnailUrl}
                    alt={canvas.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <CardHeader>
                <CardTitle className="line-clamp-1">{canvas.title}</CardTitle>
                {canvas.description && (
                  <CardDescription className="line-clamp-2">{canvas.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                    <span>{canvas.likeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👁️</span>
                    <span>{canvas.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
