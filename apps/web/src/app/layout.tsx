import type { Metadata } from "next";
import { Fira_Code, Lora, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
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
    <html lang="ja" className={`${nunito.variable} ${lora.variable} ${firaCode.variable}`}>
      <body className={`${nunito.className} antialiased`}>{children}</body>
    </html>
  );
}
