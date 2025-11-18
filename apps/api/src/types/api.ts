/**
 * API共通型定義
 *
 * バックエンドAPIとの通信で使用される共通の型を定義
 * フロントエンド（apps/web）から @api でインポート可能
 */

/**
 * API成功レスポンス
 *
 * @template T - レスポンスデータの型
 */
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

/**
 * APIエラーレスポンス
 */
export type ApiErrorResponse = {
  success: false;
  error: string;
};

/**
 * APIレスポンス（判別可能なユニオン型）
 *
 * @template T - 成功時のレスポンスデータの型
 *
 * @example
 * ```typescript
 * import type { ApiResponse } from '@api';
 *
 * type UserResponse = ApiResponse<{ user: User }>;
 *
 * const response: UserResponse = await apiClient.users.me.$get().then(r => r.json());
 *
 * if (response.success) {
 *   console.log(response.data.user);  // 型安全にアクセス可能
 * } else {
 *   console.error(response.error);
 * }
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 型ガード: 成功レスポンスかどうかを判定
 *
 * @param response - APIレスポンス
 * @returns 成功レスポンスの場合 true
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.me.$get().then(r => r.json());
 *
 * if (isSuccessResponse(response)) {
 *   // response.data に型安全にアクセス可能
 *   console.log(response.data);
 * } else {
 *   // response.error に型安全にアクセス可能
 *   console.error(response.error);
 * }
 * ```
 */
export const isSuccessResponse = <T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> => {
  return response.success;
};

/**
 * 型ガード: エラーレスポンスかどうかを判定
 *
 * @param response - APIレスポンス
 * @returns エラーレスポンスの場合 true
 *
 * @example
 * ```typescript
 * const response = await apiClient.users.me.$get().then(r => r.json());
 *
 * if (isErrorResponse(response)) {
 *   console.error(response.error);
 * }
 * ```
 */
export const isErrorResponse = <T>(response: ApiResponse<T>): response is ApiErrorResponse => {
  return !response.success;
};
