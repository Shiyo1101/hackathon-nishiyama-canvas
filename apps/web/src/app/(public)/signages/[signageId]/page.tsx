import { Eye, Flag, Monitor, Share2, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  params: Promise<{ signageId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { signageId: _signageId } = await params;

  // TODO: バックエンドAPIからサイネージデータを取得
  const title = `サイネージ詳細 | にしやまきゃんばす`;

  return {
    title,
    description: "西山動物園のデジタルサイネージ",
  };
}

const SignageDetailPage = async ({ params }: Props) => {
  const { signageId } = await params;

  // TODO: バックエンドAPIからサイネージデータを取得
  // const signage = await fetchPublicSignageBySlug(signageId);

  // 仮データ
  const signage = {
    id: "1",
    title: "レッサーパンダの紹介",
    description:
      "西山動物園のかわいいレッサーパンダたちを紹介するサイネージです。日々の様子や豆知識をお届けします。",
    signageId: signageId,
    authorName: "山田太郎",
    viewCount: 123,
    createdAt: "2025-11-01",
    updatedAt: "2025-11-05",
    isPublished: true,
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="font-bold text-xl">
            にしやまきゃんばす!
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/signages" className="text-muted-foreground text-sm hover:text-foreground">
              一覧に戻る
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                ダッシュボード
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* パンくずリスト */}
          <nav className="mb-6 text-muted-foreground text-sm">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/signages" className="hover:text-foreground">
                  公開サイネージ
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{signage.title}</li>
            </ol>
          </nav>

          {/* サイネージヘッダー */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="mb-2 font-bold text-3xl">{signage.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {signage.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {signage.viewCount} 回表示
                  </span>
                  <time>作成: {signage.createdAt}</time>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  シェア
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  通報
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground">{signage.description}</p>
          </div>

          {/* サイネージ表示エリア */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="relative w-full bg-white" style={{ aspectRatio: "16 / 9" }}>
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <Monitor className="mx-auto mb-4 h-20 w-20 text-gray-400" />
                    <h2 className="mb-2 font-bold text-gray-900 text-xl">{signage.title}</h2>
                    <p className="text-gray-600">ここにサイネージのコンテンツが表示されます</p>
                    <p className="mt-4 text-gray-500 text-sm">※この機能は現在開発中です</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 全画面ボタン */}
            <div className="mt-4 text-center">
              <Button size="lg">
                <Monitor className="mr-2 h-5 w-5" />
                全画面で表示
              </Button>
            </div>
          </div>

          {/* サイネージ情報 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold text-lg">サイネージ情報</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="mb-1 font-medium text-muted-foreground text-sm">作成者</dt>
                  <dd className="font-medium">{signage.authorName}</dd>
                </div>
                <div>
                  <dt className="mb-1 font-medium text-muted-foreground text-sm">表示回数</dt>
                  <dd className="font-medium">{signage.viewCount} 回</dd>
                </div>
                <div>
                  <dt className="mb-1 font-medium text-muted-foreground text-sm">作成日</dt>
                  <dd className="font-medium">{signage.createdAt}</dd>
                </div>
                <div>
                  <dt className="mb-1 font-medium text-muted-foreground text-sm">最終更新</dt>
                  <dd className="font-medium">{signage.updatedAt}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t bg-muted/50 py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 にしやまきゃんばす! All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignageDetailPage;
