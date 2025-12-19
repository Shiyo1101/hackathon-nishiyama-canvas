import type { SerializedCanvas } from "@api";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { fetchCanvasForPreview } from "@/features/canvas-preview/api/fetchCanvasForPreview";
import { CanvasPreviewCanvas, FullscreenButton } from "@/features/canvas-preview/components";
import type { LayoutConfig } from "@/types";

export const metadata: Metadata = {
  title: "キャンバスプレビュー | にしやまきゃんばす",
  description: "キャンバスのプレビュー表示",
};

const CanvasPreviewPage = async () => {
  let canvas: (SerializedCanvas & { layoutConfig: LayoutConfig }) | undefined;

  try {
    canvas = await fetchCanvasForPreview();
  } catch (error) {
    // キャンバスが存在しない場合はダッシュボードにリダイレクト
    console.error("Failed to fetch canvas:", error);
    redirect("/dashboard");
  }

  if (!canvas) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-gray-800 border-b bg-gray-950 px-4 py-2">
        <h1 className="font-semibold text-lg text-white">プレビューモード</h1>
        <Link
          href="/canvas/edit"
          className="inline-flex items-center text-gray-400 text-sm hover:text-gray-200"
        >
          編集画面に戻る
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* 16:9アスペクト比のプレビューエリア */}
          <Card className="overflow-hidden shadow-2xl">
            <div className="relative w-full bg-white" style={{ aspectRatio: "16 / 9" }}>
              <CanvasPreviewCanvas layoutConfig={canvas.layoutConfig} />
            </div>
          </Card>

          {/* プレビュー情報 */}
          <Card className="mt-4 bg-gray-800 p-4 text-gray-300 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{canvas.title} - 表示モード: 16:9</p>
                <p className="text-gray-400">
                  実際のデジタルキャンバスと同じアスペクト比で表示されます
                </p>
              </div>
              <div className="flex gap-2">
                <FullscreenButton layoutConfig={canvas.layoutConfig} />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CanvasPreviewPage;
