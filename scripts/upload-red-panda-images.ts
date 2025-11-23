/**
 * レッサーパンダ画像アップロードスクリプト
 *
 * open-data/red-panda-images/ 配下の画像をS3にアップロードし、
 * 動物情報としてデータベースに保存します
 *
 * 実行方法: NODE_OPTIONS='--require dotenv/config' DOTENV_CONFIG_PATH=apps/api/.env.local pnpm tsx scripts/upload-red-panda-images.ts
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { uploadImage } from "../apps/api/src/lib/s3";

const prisma = new PrismaClient();

// レッサーパンダのディレクトリパス
const RED_PANDA_DIR =
  "/Users/yoshi_mac/Desktop/mywork/hackathon/nishiyama-canvas/open-data/red-panda-images";

// 画像ファイルの拡張子
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

/**
 * ディレクトリ内の画像ファイルを取得
 */
async function getImageFiles(dirPath: string): Promise<string[]> {
  const files = await readdir(dirPath);
  return files.filter((file) => {
    const ext = file.toLowerCase().slice(file.lastIndexOf("."));
    return IMAGE_EXTENSIONS.includes(ext) && file !== "Thumbs.db";
  });
}

/**
 * 画像をS3にアップロード
 */
async function uploadPandaImage(name: string, imagePath: string, index: number): Promise<string> {
  console.log(`  📤 Uploading: ${imagePath}`);

  const imageBuffer = await readFile(imagePath);
  const ext = imagePath.toLowerCase().slice(imagePath.lastIndexOf(".") + 1);

  const result = await uploadImage(imageBuffer, {
    folder: "red-pandas",
    fileName: `${name}-${index + 1}.${ext}`,
    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    metadata: {
      species: "red-panda",
      uploadedAt: new Date().toISOString(),
    },
  });

  console.log(`  ✅ Uploaded: ${result.url}`);
  return result.url;
}

/**
 * データベースに動物情報を作成または更新
 */
async function upsertAnimal(name: string, imageUrls: string[]): Promise<void> {
  // 既存の動物情報を検索
  let animal = await prisma.animal.findFirst({
    where: { name },
  });

  if (animal) {
    // 既存の動物情報を更新
    await prisma.animal.update({
      where: { id: animal.id },
      data: {
        species: "レッサーパンダ",
        updatedAt: new Date(),
      },
    });
    console.log(`  ✅ Updated animal: ${name} (ID: ${animal.id})`);
  } else {
    // 新規に動物情報を作成
    animal = await prisma.animal.create({
      data: {
        name,
        species: "レッサーパンダ",
        description: `${name}は西山動物園のレッサーパンダです。`,
      },
    });
    console.log(`  ✅ Created animal: ${name} (ID: ${animal.id})`);
  }

  // 追加画像をAnimalImageテーブルに保存
  for (let i = 0; i < imageUrls.length; i++) {
    const existingImage = await prisma.animalImage.findFirst({
      where: {
        animalId: animal.id,
        imageUrl: imageUrls[i],
      },
    });

    if (!existingImage) {
      await prisma.animalImage.create({
        data: {
          animalId: animal.id,
          imageUrl: imageUrls[i],
          caption: `${name}の写真 ${i + 1}`,
          isFeatured: i === 0, // 最初の画像を代表画像とする
        },
      });
      console.log(`  ✅ Added image ${i + 1}/${imageUrls.length}`);
    }
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log("🐼 レッサーパンダ画像アップロード開始\n");

  try {
    // ディレクトリ一覧を取得
    const pandaNames = await readdir(RED_PANDA_DIR);

    for (const pandaName of pandaNames) {
      if (pandaName.startsWith(".")) continue; // 隠しファイルをスキップ

      console.log(`\n📁 Processing: ${pandaName}`);

      const pandaDirPath = join(RED_PANDA_DIR, pandaName);
      const imageFiles = await getImageFiles(pandaDirPath);

      if (imageFiles.length === 0) {
        console.log(`  ⚠️  No images found for ${pandaName}`);
        continue;
      }

      console.log(`  Found ${imageFiles.length} images`);

      // 画像をS3にアップロード
      const imageUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const imagePath = join(pandaDirPath, imageFiles[i]);
        try {
          const url = await uploadPandaImage(pandaName, imagePath, i);
          imageUrls.push(url);
        } catch (error) {
          console.error(`  ❌ Failed to upload ${imageFiles[i]}:`, error);
        }
      }

      // データベースに保存
      if (imageUrls.length > 0) {
        try {
          await upsertAnimal(pandaName, imageUrls);
        } catch (error) {
          console.error(`  ❌ Failed to save animal data:`, error);
        }
      }
    }

    console.log("\n✅ すべての処理が完了しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
