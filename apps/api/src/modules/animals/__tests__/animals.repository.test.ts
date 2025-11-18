import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../../lib/db";
import { createAnimalsRepository } from "../animals.repository";

describe("AnimalsRepository", () => {
  const animalsRepository = createAnimalsRepository(prisma);

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await prisma.animalImage.deleteMany();
    await prisma.animal.deleteMany();
  });

  describe("findManyAnimals", () => {
    it("動物一覧を取得できる", async () => {
      // Arrange
      await prisma.animal.createMany({
        data: [
          {
            name: "パンダ太郎",
            species: "レッサーパンダ",
            status: "active",
          },
          {
            name: "パンダ花子",
            species: "レッサーパンダ",
            status: "active",
          },
        ],
      });

      // Act
      const animals = await animalsRepository.findManyAnimals();

      // Assert
      expect(animals).toHaveLength(2);
      expect(animals[0].name).toBe("パンダ太郎"); // 名前順
    });

    it("ステータスでフィルタできる", async () => {
      // Arrange
      await prisma.animal.createMany({
        data: [
          { name: "アクティブ", species: "種", status: "active" },
          { name: "非アクティブ", species: "種", status: "inactive" },
        ],
      });

      // Act
      const animals = await animalsRepository.findManyAnimals({ status: "active" });

      // Assert
      expect(animals).toHaveLength(1);
      expect(animals[0].status).toBe("active");
    });

    it("limit, offsetで件数を制限できる", async () => {
      // Arrange
      await prisma.animal.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          name: `動物${String.fromCharCode(65 + i)}`, // A, B, C, D, E
          species: "種",
          status: "active" as const,
        })),
      });

      // Act
      const animals = await animalsRepository.findManyAnimals({ limit: 2, offset: 1 });

      // Assert
      expect(animals).toHaveLength(2);
      expect(animals[0].name).toBe("動物B"); // 名前順
      expect(animals[1].name).toBe("動物C");
    });
  });

  describe("findAnimalById", () => {
    it("IDで動物を取得できる", async () => {
      // Arrange
      const created = await prisma.animal.create({
        data: {
          name: "テスト動物",
          species: "テスト種",
          description: "テスト説明",
        },
      });

      // Act
      const animal = await animalsRepository.findAnimalById(created.id);

      // Assert
      expect(animal).not.toBeNull();
      expect(animal?.name).toBe("テスト動物");
    });

    it("存在しないIDの場合nullを返す", async () => {
      // Act
      const animal = await animalsRepository.findAnimalById("non-existent-id");

      // Assert
      expect(animal).toBeNull();
    });
  });

  describe("countAnimals", () => {
    it("動物の総数を取得できる", async () => {
      // Arrange
      await prisma.animal.createMany({
        data: [
          { name: "動物1", species: "種" },
          { name: "動物2", species: "種" },
        ],
      });

      // Act
      const count = await animalsRepository.countAnimals();

      // Assert
      expect(count).toBe(2);
    });

    it("ステータスでフィルタした総数を取得できる", async () => {
      // Arrange
      await prisma.animal.createMany({
        data: [
          { name: "動物1", species: "種", status: "active" },
          { name: "動物2", species: "種", status: "inactive" },
        ],
      });

      // Act
      const count = await animalsRepository.countAnimals("active");

      // Assert
      expect(count).toBe(1);
    });
  });

  describe("findAnimalImages", () => {
    it("動物の画像一覧を取得できる", async () => {
      // Arrange
      const animal = await prisma.animal.create({
        data: { name: "テスト動物", species: "種" },
      });

      await prisma.animalImage.createMany({
        data: [
          {
            animalId: animal.id,
            imageUrl: "https://example.com/image1.jpg",
            isFeatured: true,
          },
          {
            animalId: animal.id,
            imageUrl: "https://example.com/image2.jpg",
            isFeatured: false,
          },
        ],
      });

      // Act
      const images = await animalsRepository.findAnimalImages(animal.id);

      // Assert
      expect(images).toHaveLength(2);
      expect(images[0].isFeatured).toBe(true); // 注目順、作成日降順
    });

    it("isFeaturedでフィルタできる", async () => {
      // Arrange
      const animal = await prisma.animal.create({
        data: { name: "テスト動物", species: "種" },
      });

      await prisma.animalImage.createMany({
        data: [
          { animalId: animal.id, imageUrl: "url1", isFeatured: true },
          { animalId: animal.id, imageUrl: "url2", isFeatured: false },
        ],
      });

      // Act
      const images = await animalsRepository.findAnimalImages(animal.id, {
        isFeatured: true,
      });

      // Assert
      expect(images).toHaveLength(1);
      expect(images[0].isFeatured).toBe(true);
    });
  });

  describe("countAnimalImages", () => {
    it("動物画像の総数を取得できる", async () => {
      // Arrange
      const animal = await prisma.animal.create({
        data: { name: "テスト動物", species: "種" },
      });

      await prisma.animalImage.createMany({
        data: [
          { animalId: animal.id, imageUrl: "url1" },
          { animalId: animal.id, imageUrl: "url2" },
        ],
      });

      // Act
      const count = await animalsRepository.countAnimalImages(animal.id);

      // Assert
      expect(count).toBe(2);
    });
  });

  describe("findAnimalImageById", () => {
    it("IDで動物画像を取得できる", async () => {
      // Arrange
      const animal = await prisma.animal.create({
        data: { name: "テスト動物", species: "種" },
      });

      const image = await prisma.animalImage.create({
        data: {
          animalId: animal.id,
          imageUrl: "https://example.com/test.jpg",
          caption: "テストキャプション",
        },
      });

      // Act
      const found = await animalsRepository.findAnimalImageById(image.id);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.caption).toBe("テストキャプション");
    });

    it("存在しないIDの場合nullを返す", async () => {
      // Act
      const image = await animalsRepository.findAnimalImageById("non-existent-id");

      // Assert
      expect(image).toBeNull();
    });
  });
});
