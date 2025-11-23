/**
 * テストデータ投入スクリプト
 * ニュース、動物、動物画像のサンプルデータを作成
 */
import { prisma } from "./src/lib/db";

async function main() {
  console.log("テストデータ投入開始...\n");

  // ニュースデータ作成
  console.log("1. ニュースデータを作成中...");
  const news = await prisma.news.createMany({
    data: [
      {
        title: "レッサーパンダの赤ちゃん誕生！",
        content:
          "西山動物園で待望のレッサーパンダの赤ちゃんが誕生しました。母子ともに健康で、すくすくと成長しています。",
        summary: "レッサーパンダの赤ちゃんが誕生しました",
        category: "お知らせ",
        imageUrl: "https://placehold.co/800x450/ff6b6b/white?text=Baby+Panda",
        publishedAt: new Date("2025-01-15"),
      },
      {
        title: "冬季限定イベント開催のお知らせ",
        content:
          "1月20日から2月末まで、冬季限定イベント「レッサーパンダと雪遊び」を開催します。雪の中で遊ぶ可愛らしい姿をぜひご覧ください。",
        summary: "冬季限定イベントを開催します",
        category: "イベント",
        imageUrl: "https://placehold.co/800x450/4ecdc4/white?text=Winter+Event",
        publishedAt: new Date("2025-01-10"),
      },
      {
        title: "飼育員が語るレッサーパンダの魅力",
        content:
          "長年レッサーパンダの飼育に携わってきた飼育員が、その魅力や日々の様子についてお話しします。",
        summary: "飼育員インタビュー記事",
        category: "特集",
        imageUrl: "https://placehold.co/800x450/95e1d3/333?text=Keeper+Interview",
        publishedAt: new Date("2025-01-05"),
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✓ ${news.count}件のニュースを作成しました\n`);

  // 動物データ作成
  console.log("2. 動物データを作成中...");
  const panda1 = await prisma.animal.upsert({
    where: { id: "test-animal-1" },
    update: {},
    create: {
      id: "test-animal-1",
      name: "パンダ太郎",
      species: "レッサーパンダ",
      description: "人懐っこい性格で、来園者に大人気の男の子です。",
      habitat: "中国南部、ネパール、ブータン",
      diet: "竹、果物、昆虫",
      status: "active",
    },
  });

  const panda2 = await prisma.animal.upsert({
    where: { id: "test-animal-2" },
    update: {},
    create: {
      id: "test-animal-2",
      name: "パンダ花子",
      species: "レッサーパンダ",
      description: "おっとりした性格で、のんびり過ごすのが好きな女の子です。",
      habitat: "中国南部、ネパール、ブータン",
      diet: "竹、果物、昆虫",
      status: "active",
    },
  });

  console.log(`✓ 2件の動物を作成しました\n`);

  // 動物画像データ作成
  console.log("3. 動物画像データを作成中...");
  const images = await prisma.animalImage.createMany({
    data: [
      {
        animalId: panda1.id,
        imageUrl: "https://placehold.co/1200x800/f38181/white?text=Panda+Taro+Climbing",
        thumbnailUrl: "https://placehold.co/400x300/f38181/white?text=Taro+1",
        caption: "木登りをするパンダ太郎",
        isFeatured: true,
      },
      {
        animalId: panda1.id,
        imageUrl: "https://placehold.co/1200x800/aa96da/white?text=Panda+Taro+Eating",
        thumbnailUrl: "https://placehold.co/400x300/aa96da/white?text=Taro+2",
        caption: "リンゴを食べるパンダ太郎",
        isFeatured: false,
      },
      {
        animalId: panda2.id,
        imageUrl: "https://placehold.co/1200x800/fcbad3/333?text=Panda+Hanako+Sunbathing",
        thumbnailUrl: "https://placehold.co/400x300/fcbad3/333?text=Hanako+1",
        caption: "日向ぼっこするパンダ花子",
        isFeatured: true,
      },
      {
        animalId: panda2.id,
        imageUrl: "https://placehold.co/1200x800/a8e6cf/333?text=Panda+Hanako+Bamboo",
        thumbnailUrl: "https://placehold.co/400x300/a8e6cf/333?text=Hanako+2",
        caption: "竹を食べるパンダ花子",
        isFeatured: false,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✓ ${images.count}件の動物画像を作成しました\n`);

  console.log("✅ テストデータ投入完了！");
}

main()
  .catch((e) => {
    console.error("エラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
