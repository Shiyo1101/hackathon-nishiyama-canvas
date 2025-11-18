import type { SerializedSignage } from "@api";
import { HeartIcon, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PopularSignageListPresentationProps = {
  signages: SerializedSignage[];
};

export const PopularSignageListPresentation = ({
  signages,
}: PopularSignageListPresentationProps) => {
  // サイネージが一つもない場合
  if (signages.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Card className="w-full border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">人気のサイネージはまだありません</CardTitle>
            <CardDescription>
              他のユーザーがサイネージを公開すると、ここに表示されます。
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  // サイネージがある場合
  return (
    <section className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        <h2 className="font-bold text-xl">人気のサイネージ</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signages.map((signage) => (
          <Link key={signage.id} href={`/signage/${signage.slug}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              {/* サムネイル画像 */}
              {signage.thumbnailUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={signage.thumbnailUrl}
                    alt={signage.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <CardHeader>
                <CardTitle className="line-clamp-1">{signage.title}</CardTitle>
                {signage.description && (
                  <CardDescription className="line-clamp-2">{signage.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                    <span>{signage.likeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👁️</span>
                    <span>{signage.viewCount.toLocaleString()}</span>
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
