import { ArrowLeft, Monitor } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "サイネージプレビュー | にしやまきゃんばす",
  description: "サイネージのプレビュー表示",
};

const SignagePreviewPage = async () => {
  // TODO: バックエンドAPIからサイネージデータを取得
  // const signage = await fetchMySignage();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-gray-800 border-b bg-gray-950 px-4 py-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-400 text-sm hover:text-gray-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ダッシュボードに戻る
        </Link>
        <h1 className="font-semibold text-lg text-white">プレビューモード</h1>
        <Link href="/signage/edit">
          <Button size="sm">編集</Button>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* 16:9アスペクト比のプレビューエリア */}
          <Card className="overflow-hidden shadow-2xl">
            <div className="relative w-full bg-white" style={{ aspectRatio: "16 / 9" }}>
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div>
                  <Monitor className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h2 className="mb-2 font-bold text-gray-900 text-xl">サイネージプレビュー</h2>
                  <p className="text-gray-600">ここにあなたのサイネージが表示されます</p>
                  <p className="mt-4 text-gray-500 text-sm">※この機能は現在開発中です</p>
                </div>
              </div>
            </div>
          </Card>

          {/* プレビュー情報 */}
          <Card className="mt-4 bg-gray-800 p-4 text-gray-300 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">表示モード: 16:9</p>
                <p className="text-gray-400">
                  実際のデジタルサイネージと同じアスペクト比で表示されます
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  全画面表示
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SignagePreviewPage;
