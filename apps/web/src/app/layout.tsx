import type { Metadata } from "next";
import { Fira_Code, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "にしやまきゃんばす!",
  description:
    "福井県鯖江市「西山動物園」のレッサーパンダをテーマにしたデジタルサイネージ作成・管理アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${nunito.variable} ${firaCode.variable}`}>
      <body className={`${nunito.className} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster closeButton richColors />
      </body>
    </html>
  );
}
