import type { Metadata } from "next";
import { Kiwi_Maru, Mochiy_Pop_One } from "next/font/google";
import "./globals.css";

const kiwiMaru = Kiwi_Maru({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-kiwi-maru",
  preload: true,
  display: "swap",
});

const mochiyPopOne = Mochiy_Pop_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mochiy-pop-one",
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "にしやまきゃんばす！",
  description:
    "福井県鯖江市「西山動物園」のレッサーパンダをテーマにしたデジタルサイネージ作成・管理アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${kiwiMaru.variable} ${mochiyPopOne.variable}`}>
      <body className={`${kiwiMaru.className} antialiased`}>{children}</body>
    </html>
  );
}
