/**
 * デフォルトテンプレートの定義
 */

import type { SignageTemplate } from "./signage";

/**
 * デフォルトテンプレート一覧
 */
export const DEFAULT_TEMPLATES: SignageTemplate[] = [
  {
    id: "template-basic",
    name: "ベーシック",
    description: "シンプルなレイアウトテンプレート",
    thumbnailUrl: "/templates/basic.png",
    defaultLayout: {
      templateId: "template-basic",
      background: {
        type: "color",
        value: "#ffffff",
      },
      grid: {
        columns: 12,
        rows: 8,
        gap: 8,
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
          type: "image",
          position: { x: 0, y: 4, w: 12, h: 4 },
        },
      ],
    },
  },
  {
    id: "template-news-focus",
    name: "ニュース重視",
    description: "ニュースを大きく表示するレイアウト",
    thumbnailUrl: "/templates/news-focus.png",
    defaultLayout: {
      templateId: "template-news-focus",
      background: {
        type: "color",
        value: "#f0f9ff",
      },
      grid: {
        columns: 12,
        rows: 8,
        gap: 8,
      },
      items: [
        {
          id: "item-1",
          type: "news",
          position: { x: 0, y: 0, w: 8, h: 6 },
        },
        {
          id: "item-2",
          type: "animal",
          position: { x: 8, y: 0, w: 4, h: 3 },
        },
        {
          id: "item-3",
          type: "image",
          position: { x: 8, y: 3, w: 4, h: 3 },
        },
        {
          id: "item-4",
          type: "text",
          position: { x: 0, y: 6, w: 12, h: 2 },
          textContent: "西山動物園へようこそ!",
          style: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1e40af",
          },
        },
      ],
    },
  },
  {
    id: "template-animal-showcase",
    name: "どうぶつギャラリー",
    description: "動物の写真を多く配置するレイアウト",
    thumbnailUrl: "/templates/animal-showcase.png",
    defaultLayout: {
      templateId: "template-animal-showcase",
      background: {
        type: "color",
        value: "#fef3c7",
      },
      grid: {
        columns: 12,
        rows: 8,
        gap: 8,
      },
      items: [
        {
          id: "item-1",
          type: "text",
          position: { x: 0, y: 0, w: 12, h: 1 },
          textContent: "レッサーパンダたち",
          style: {
            fontSize: "32px",
            fontWeight: "bold",
            color: "#92400e",
          },
        },
        {
          id: "item-2",
          type: "animal",
          position: { x: 0, y: 1, w: 4, h: 3 },
        },
        {
          id: "item-3",
          type: "animal",
          position: { x: 4, y: 1, w: 4, h: 3 },
        },
        {
          id: "item-4",
          type: "animal",
          position: { x: 8, y: 1, w: 4, h: 3 },
        },
        {
          id: "item-5",
          type: "news",
          position: { x: 0, y: 4, w: 12, h: 4 },
        },
      ],
    },
  },
  {
    id: "template-grid-compact",
    name: "コンパクト",
    description: "多くの情報を詰め込むレイアウト",
    thumbnailUrl: "/templates/compact.png",
    defaultLayout: {
      templateId: "template-grid-compact",
      background: {
        type: "color",
        value: "#ecfdf5",
      },
      grid: {
        columns: 12,
        rows: 8,
        gap: 4,
      },
      items: [
        {
          id: "item-1",
          type: "news",
          position: { x: 0, y: 0, w: 4, h: 4 },
        },
        {
          id: "item-2",
          type: "animal",
          position: { x: 4, y: 0, w: 4, h: 4 },
        },
        {
          id: "item-3",
          type: "image",
          position: { x: 8, y: 0, w: 4, h: 4 },
        },
        {
          id: "item-4",
          type: "text",
          position: { x: 0, y: 4, w: 6, h: 2 },
          textContent: "開園時間: 9:00-16:30",
        },
        {
          id: "item-5",
          type: "user_image",
          position: { x: 6, y: 4, w: 6, h: 4 },
        },
        {
          id: "item-6",
          type: "news",
          position: { x: 0, y: 6, w: 6, h: 2 },
        },
      ],
    },
  },
];
