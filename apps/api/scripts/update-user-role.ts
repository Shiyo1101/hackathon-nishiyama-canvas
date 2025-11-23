import { PrismaClient } from "../src/lib/db";

const prisma = new PrismaClient();

async function main() {
  // すべてのユーザーを取得
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log("現在のユーザー一覧:");
  console.table(users);

  // 最初のユーザーを管理者に変更（開発環境用）
  if (users.length > 0) {
    const firstUser = users[0];
    const updated = await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: "admin" },
    });
    console.log("\n管理者権限を付与しました:");
    console.log(`ID: ${updated.id}`);
    console.log(`Email: ${updated.email}`);
    console.log(`Name: ${updated.name}`);
    console.log(`Role: ${updated.role}`);
  } else {
    console.log("ユーザーが見つかりませんでした");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
