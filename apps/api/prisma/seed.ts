import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("シードデータの投入を開始します...");

  // 管理者ユーザー作成
  const admin = await prisma.user.upsert({
    where: { email: "admin@nishiyama-canvas.local" },
    update: {},
    create: {
      email: "admin@nishiyama-canvas.local",
      name: "管理者",
      role: "admin",
      emailVerified: true,
    },
  });
  console.log("✓ 管理者ユーザーを作成しました:", admin.email);

  // テストユーザー作成
  const testUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "テストユーザー",
      role: "user",
      emailVerified: true,
    },
  });
  console.log("✓ テストユーザーを作成しました:", testUser.email);

  // レッサーパンダ情報作成
  const redPanda = await prisma.animal.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "レッサーパンダ",
      species: "Ailurus fulgens",
      description:
        "西山動物園の人気者！愛くるしいレッサーパンダたち。木登りが得意で、主に竹や果物を食べます。",
      habitat: "中国南部、ヒマラヤ山脈東部の森林地帯",
      diet: "竹、果物、昆虫、鳥の卵など",
      status: "active",
    },
  });
  console.log("✓ レッサーパンダ情報を作成しました:", redPanda.name);

  // サンプル画像を追加（オープンデータのプレースホルダー）
  const sampleImages = [
    {
      caption: "木の上で休むレッサーパンダ",
      isFeatured: true,
    },
    {
      caption: "りんごを食べるレッサーパンダ",
      isFeatured: false,
    },
    {
      caption: "雪の中で遊ぶレッサーパンダ",
      isFeatured: false,
    },
  ];

  for (const [index, imageData] of sampleImages.entries()) {
    await prisma.animalImage.create({
      data: {
        animalId: redPanda.id,
        imageUrl: `https://placehold.co/800x600/orange/white?text=Red+Panda+${index + 1}`,
        thumbnailUrl: `https://placehold.co/400x300/orange/white?text=Red+Panda+${index + 1}`,
        caption: imageData.caption,
        isFeatured: imageData.isFeatured,
      },
    });
  }
  console.log(`✓ ${sampleImages.length}件のサンプル画像を作成しました`);

  // サンプルニュース作成
  const newsItems = [
    {
      title: "レッサーパンダの赤ちゃんが誕生しました！",
      content:
        "西山動物園に新しい仲間が加わりました。元気な赤ちゃんレッサーパンダが誕生し、すくすくと成長しています。名前は公募で決定予定です。",
      summary: "レッサーパンダの赤ちゃんが誕生",
      category: "news",
      imageUrl: "https://placehold.co/800x600/orange/white?text=Baby+Red+Panda",
      publishedAt: new Date("2025-01-15"),
    },
    {
      title: "冬季限定！レッサーパンダの雪遊び公開中",
      content:
        "寒い冬でも元気いっぱいのレッサーパンダたち。雪の中で遊ぶ姿を見ることができます。午前10時と午後2時の給餌時間がおすすめです。",
      summary: "雪の中で遊ぶレッサーパンダ",
      category: "event",
      imageUrl: "https://placehold.co/800x600/lightblue/white?text=Snow+Play",
      publishedAt: new Date("2025-01-10"),
    },
    {
      title: "レッサーパンダの生態について学ぼう",
      content:
        "レッサーパンダは絶滅危惧種に指定されています。西山動物園では保護活動にも力を入れています。週末には飼育員による解説も行っています。",
      summary: "レッサーパンダの生態と保護活動",
      category: "education",
      imageUrl: "https://placehold.co/800x600/green/white?text=Education",
      publishedAt: new Date("2025-01-05"),
    },
  ];

  for (const newsData of newsItems) {
    await prisma.news.create({
      data: newsData,
    });
  }
  console.log(`✓ ${newsItems.length}件のサンプルニュースを作成しました`);

  // テストユーザーのサンプルサイネージ作成
  const sampleSignage = await prisma.signage.create({
    data: {
      userId: testUser.id,
      title: "レッサーパンダ応援サイネージ",
      description: "西山動物園のかわいいレッサーパンダたちを紹介します！",
      slug: `user-${testUser.id}`,
      isPublic: true,
      layoutConfig: {
        template_id: "template-01",
        background: {
          type: "color",
          color: "#fff5e6",
        },
        grid: {
          columns: 12,
          rows: 8,
        },
        items: [
          {
            id: "item-1",
            type: "news",
            position: { x: 0, y: 0, w: 6, h: 4 },
          },
          {
            id: "item-2",
            type: "animal",
            position: { x: 6, y: 0, w: 6, h: 4 },
          },
        ],
      },
    },
  });
  console.log("✓ サンプルサイネージを作成しました:", sampleSignage.title);

  console.log("\n✅ シードデータの投入が完了しました！");
}

main()
  .catch((e) => {
    console.error("❌ エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
