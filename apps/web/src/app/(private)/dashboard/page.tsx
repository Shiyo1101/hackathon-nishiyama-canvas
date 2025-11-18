import type { Metadata } from "next";
import { PageContainer } from "@/components/layout";
import { Header } from "@/features/common/components/Header";

import { LinkCard } from "@/features/dashboard/components/LinkCard";
export const metadata: Metadata = {
  title: "ダッシュボード | にしやまきゃんばす",
  description: "サイネージ管理ダッシュボード",
};

const MySignagePage = async () => {
  const linkCards = [
    {
      title: "マイサイネージページ",
      description: "あなたのデジタルサイネージを作成・管理します。",
      imageUrl: "/images/logo.png",
      href: "/signage/me",
    },
    {
      title: "みんなのサイネージを見る",
      description: "他の人が作ったサイネージをたくさんみよう。",
      imageUrl: "/images/dashboard/public-signage.avif",
      href: "/signages",
    },
    {
      title: "ニュースを読む",
      description: "西山動物園からの最新情報をお届けします。",
      imageUrl: "/images/dashboard/news.avif",
      href: "/news",
    },
    {
      title: "写真を探す",
      description: "サイネージに使えるレッサーパンダの写真を探します。",
      imageUrl: "/images/dashboard/gallery.avif",
      href: "/photos",
    },
  ];

  return (
    <>
      <Header />
      <main>
        <PageContainer maxWidth="6xl">
          <h1 className="mb-1 font-bold text-3xl">ダッシュボード</h1>
          <p className="mb-4 text-foreground">
            西山動物園のレッサーパンダをテーマにしたデジタルサイネージを作成しよう！
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {linkCards.map((card) => (
              <LinkCard key={card.href} {...card} />
            ))}
          </div>
        </PageContainer>
      </main>
    </>
  );
};

export default MySignagePage;
