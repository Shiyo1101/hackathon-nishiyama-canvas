import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

// パスワードをハッシュ化する関数
async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

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

  // テストユーザーのパスワード付きアカウント作成
  const hashedPassword = await hashPassword("password");
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: testUser.id,
      providerId: "credential",
    },
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: testUser.id,
        accountId: testUser.id,
        providerId: "credential",
        password: hashedPassword,
      },
    });
    console.log("✓ テストユーザーのパスワードを設定しました");
  } else {
    console.log("✓ テストユーザーのパスワードは既に設定済みです");
  }

  // 管理者ユーザーのパスワード付きアカウント作成
  const existingAdminAccount = await prisma.account.findFirst({
    where: {
      userId: admin.id,
      providerId: "credential",
    },
  });

  if (!existingAdminAccount) {
    const hashedAdminPassword = await hashPassword("adminpassword");
    await prisma.account.create({
      data: {
        userId: admin.id,
        accountId: admin.id,
        providerId: "credential",
        password: hashedAdminPassword,
      },
    });
    console.log("✓ 管理者ユーザーのパスワードを設定しました");
  } else {
    console.log("✓ 管理者ユーザーのパスワードは既に設定済みです");
  }

  // デフォルトテーマ作成
  const defaultTheme = await prisma.theme.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "デフォルトテーマ",
      fontFamily: "Noto Sans JP",
      primaryColor: "#FF6B6B",
      secondaryColor: "#4ECDC4",
      backgroundColor: "#FFFFFF",
      isDefault: true,
    },
  });
  console.log("✓ デフォルトテーマを作成しました:", defaultTheme.name);

  // 追加テーマ（レッサーパンダカラー）
  const redPandaTheme = await prisma.theme.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "レッサーパンダテーマ",
      fontFamily: "Noto Sans JP",
      primaryColor: "#D2691E",
      secondaryColor: "#FF8C00",
      backgroundColor: "#FFF5E6",
      isDefault: false,
    },
  });
  console.log("✓ レッサーパンダテーマを作成しました:", redPandaTheme.name);

  // 追加テーマ（ナチュラルグリーン）
  const natureTheme = await prisma.theme.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      name: "ナチュラルグリーンテーマ",
      fontFamily: "Noto Sans JP",
      primaryColor: "#228B22",
      secondaryColor: "#90EE90",
      backgroundColor: "#F0FFF0",
      isDefault: false,
    },
  });
  console.log("✓ ナチュラルグリーンテーマを作成しました:", natureTheme.name);

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

  // テストユーザー2作成
  const testUser2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      name: "テストユーザー2",
      role: "user",
      emailVerified: true,
    },
  });
  console.log("✓ テストユーザー2を作成しました:", testUser2.email);

  // テストユーザー2のパスワード設定
  const existingAccount2 = await prisma.account.findFirst({
    where: { userId: testUser2.id, providerId: "credential" },
  });
  if (!existingAccount2) {
    await prisma.account.create({
      data: {
        userId: testUser2.id,
        accountId: testUser2.id,
        providerId: "credential",
        password: await hashPassword("password"),
      },
    });
    console.log("✓ テストユーザー2のパスワードを設定しました");
  }

  // テストユーザー3作成
  const testUser3 = await prisma.user.upsert({
    where: { email: "user3@example.com" },
    update: {},
    create: {
      email: "user3@example.com",
      name: "テストユーザー3",
      role: "user",
      emailVerified: true,
    },
  });
  console.log("✓ テストユーザー3を作成しました:", testUser3.email);

  // テストユーザー3のパスワード設定
  const existingAccount3 = await prisma.account.findFirst({
    where: { userId: testUser3.id, providerId: "credential" },
  });
  if (!existingAccount3) {
    await prisma.account.create({
      data: {
        userId: testUser3.id,
        accountId: testUser3.id,
        providerId: "credential",
        password: await hashPassword("password"),
      },
    });
    console.log("✓ テストユーザー3のパスワードを設定しました");
  }

  // サンプルサイネージ作成（複数のユーザー分）
  const signageData = [
    {
      userId: testUser.id,
      title: "レッサーパンダ応援サイネージ",
      description: "西山動物園のかわいいレッサーパンダたちを紹介します！",
      slug: `test-user-signage`,
      isPublic: true,
      thumbnailUrl: "https://placehold.co/1200x630/orange/white?text=Red+Panda+Signage",
      viewCount: 120,
      likeCount: 45,
    },
    {
      userId: testUser2.id,
      title: "レッサーパンダの魅力を伝える",
      description: "可愛いレッサーパンダの日常をお届けします",
      slug: `popular-red-panda`,
      isPublic: true,
      thumbnailUrl: "https://placehold.co/1200x630/brown/white?text=Popular+Signage",
      viewCount: 89,
      likeCount: 32,
    },
    {
      userId: testUser3.id,
      title: "西山動物園の魅力",
      description: "レッサーパンダと一緒に楽しむ動物園ライフ",
      slug: `zoo-life`,
      isPublic: true,
      thumbnailUrl: "https://placehold.co/1200x630/green/white?text=Zoo+Life",
      viewCount: 67,
      likeCount: 28,
    },
  ];

  const createdSignages = [];
  for (const data of signageData) {
    const signage = await prisma.signage.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        layoutConfig: {
          template_id: "template-01",
          theme: {
            id: defaultTheme.id,
            name: defaultTheme.name,
            fontFamily: defaultTheme.fontFamily,
            primaryColor: defaultTheme.primaryColor,
            secondaryColor: defaultTheme.secondaryColor,
            backgroundColor: defaultTheme.backgroundColor,
          },
          background: {
            type: "color",
            color: "#fff5e6",
          },
          grid: {
            columns: 12,
            rows: 8,
          },
          weather: {
            enabled: true,
            location: {
              type: "manual",
              latitude: 35.9447,
              longitude: 136.1847,
              cityName: "鯖江市",
            },
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
            {
              id: "item-3",
              type: "weather",
              position: { x: 0, y: 4, w: 4, h: 2 },
            },
          ],
        },
      },
    });
    createdSignages.push(signage);
    console.log("✓ サイネージを作成しました:", signage.title);
  }

  // お気に入りデータの作成
  const favoriteData = [
    {
      userId: testUser.id,
      signageId: createdSignages[1].id, // testUser2のサイネージをお気に入り
    },
    {
      userId: testUser.id,
      signageId: createdSignages[2].id, // testUser3のサイネージをお気に入り
    },
    {
      userId: testUser2.id,
      signageId: createdSignages[0].id, // testUserのサイネージをお気に入り
    },
    {
      userId: testUser3.id,
      signageId: createdSignages[0].id, // testUserのサイネージをお気に入り
    },
  ];

  for (const favData of favoriteData) {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_signageId: {
          userId: favData.userId,
          signageId: favData.signageId,
        },
      },
    });

    if (!existingFavorite) {
      await prisma.favorite.create({
        data: favData,
      });
      // お気に入り追加時にlikeCountをインクリメント
      await prisma.signage.update({
        where: { id: favData.signageId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
    }
  }
  console.log(`✓ ${favoriteData.length}件のお気に入りデータを作成しました`);

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
