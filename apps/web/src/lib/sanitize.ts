/**
 * XSS対策: テキストのサニタイゼーション
 *
 * HTMLタグやスクリプトを無害化してXSS攻撃を防ぐ
 */

/**
 * テキストをサニタイズする
 *
 * - HTMLタグを除去
 * - 危険な文字をエスケープ
 * - 最大文字数を制限
 *
 * @param text - サニタイズするテキスト
 * @param maxLength - 最大文字数（デフォルト: 1000）
 * @returns サニタイズされたテキスト
 */
export const sanitizeText = (text: string, maxLength = 1000): string => {
  if (!text) return "";

  // HTMLタグを除去
  let sanitized = text.replace(/<[^>]*>/g, "");

  // 危険な文字をエスケープ（念のため）
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // 最大文字数を制限
  if (sanitized.length > maxLength) {
    sanitized = `${sanitized.substring(0, maxLength)}...`;
  }

  return sanitized;
};

/**
 * スタイル値をバリデーション・サニタイズ
 *
 * - CSS injection攻撃を防ぐ
 * - 許可されたCSS値のみを通す
 *
 * @param value - CSSの値
 * @param type - スタイルのタイプ
 * @returns サニタイズされたCSS値
 */
export const sanitizeStyleValue = (
  value: string | number | undefined,
  type: "fontSize" | "rotation" | "color" | "backgroundColor" | "lineHeight" | "letterSpacing",
): string | undefined => {
  if (value === undefined || value === null) return undefined;

  switch (type) {
    case "fontSize":
    case "lineHeight":
    case "letterSpacing": {
      // 数値+単位のみ許可（px, em, rem, %）
      const stringValue = String(value);
      if (/^[\d.]+(?:px|em|rem|%)$/.test(stringValue)) {
        return stringValue;
      }
      return undefined;
    }

    case "rotation": {
      // 数値のみ許可（-360 ~ 360度）
      const numValue = Number(value);
      if (!Number.isNaN(numValue) && numValue >= -360 && numValue <= 360) {
        return `${numValue}deg`;
      }
      return undefined;
    }

    case "color":
    case "backgroundColor": {
      // HEXカラーコードまたはRGB(A)のみ許可
      const stringValue = String(value);
      if (
        /^#[0-9A-Fa-f]{3,8}$/.test(stringValue) ||
        /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(stringValue)
      ) {
        return stringValue;
      }
      return undefined;
    }

    default:
      return undefined;
  }
};

/**
 * テキストアライメントをバリデーション
 */
export const validateTextAlign = (
  value: string | undefined,
): "left" | "center" | "right" | undefined => {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }
  return undefined;
};

/**
 * 垂直アライメントをバリデーション
 */
export const validateVerticalAlign = (
  value: string | undefined,
): "top" | "center" | "bottom" | undefined => {
  if (value === "top" || value === "center" || value === "bottom") {
    return value;
  }
  return undefined;
};
