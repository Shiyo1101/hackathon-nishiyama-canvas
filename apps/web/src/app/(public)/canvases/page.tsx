import { Eye, ImageIcon, Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "公開キャンバス一覧 | にしやまきゃんばす",
  description: "みんなが作成した公開キャンバス一覧",
};

const PublicCanvassPage = async () => {
  // TODO: バックエンドAPIから公開キャンバス一覧を取得
  // const canvases = await fetchPublicCanvass();
  // 仮データ
  const canvases = [
    {
      id: "1",
      title: "レッサーパンダの紹介",
      description: "西山動物園のかわいいレッサーパンダたち",
      slug: "red-panda-intro",
      authorName: "山田太郎",
      viewCount: 123,
      createdAt: "2025-11-01",
    },
    {
      id: "2",
      title: "動物園イベント情報",
      description: "今月の特別イベントをご紹介",
      slug: "events-november",
      authorName: "佐藤花子",
      viewCount: 89,
      createdAt: "2025-11-03",
    },
    {
      id: "3",
      title: "レッサーパンダの1日",
      description: "朝から夜までの様子をお届け",
      slug: "daily-life",
      authorName: "鈴木一郎",
      viewCount: 245,
      createdAt: "2025-10-28",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="font-bold text-xl">
            にしやまきゃんばす!
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground text-sm hover:text-foreground">
              ダッシュボード
            </Link>
            <Link href="/login">
              <Button>ログイン</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* ページヘッダー */}
          <div className="mb-8">
            <h1 className="mb-2 font-bold text-3xl">公開キャンバス一覧</h1>
            <p className="text-muted-foreground">
              みんなが作成した西山動物園のデジタルキャンバスをご覧いただけます
            </p>
          </div>

          {/* フィルター・ソート */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">{canvases.length} 件のキャンバス</div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="新着順" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">新着順</SelectItem>
                <SelectItem value="popular">人気順</SelectItem>
                <SelectItem value="oldest">古い順</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* キャンバスカード一覧 */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {canvases.map((canvas) => (
              <Link key={canvas.id} href={`/canvases/${canvas.slug}`}>
                <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                  {/* サムネイル */}
                  <div className="relative aspect-video bg-linear-to-br from-blue-100 to-purple-100">
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>

                  {/* カード内容 */}
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-semibold group-hover:text-primary">{canvas.title}</h3>
                    <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
                      {canvas.description}
                    </p>

                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span>{canvas.authorName}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {canvas.viewCount}
                        </span>
                        <time>{canvas.createdAt}</time>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 空の状態 */}
          {canvases.length === 0 && (
            <div className="py-12 text-center">
              <Inbox className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">公開キャンバスがありません</h3>
              <p className="text-muted-foreground">最初のキャンバスを作成してみませんか？</p>
            </div>
          )}
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

export default PublicCanvassPage;
