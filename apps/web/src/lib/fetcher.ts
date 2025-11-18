import "server-only";

import type { Session, SessionData, User } from "@api";
import { headers } from "next/headers";
import { cache } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * ログインユーザーのセッションデータを取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @returns セッションデータ（未認証の場合は null）
 * @throws エラーが発生した場合はログ出力して null を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchMe } from "@/lib/fetcher";
 *
 * export default async function DashboardPage() {
 *   const session = await fetchMe();
 *
 *   if (!session) {
 *     redirect("/sign-in");
 *   }
 *
 *   return <div>Welcome, {session.user.name}!</div>;
 * }
 * ```
 */
export const fetchSession = cache(async (): Promise<Session | null> => {
  try {
    const headersList = await headers();

    const response = await authClient.getSession({
      fetchOptions: {
        headers: headersList,
      },
    });

    // response.data が null の場合のハンドリング
    if (!response.data) {
      return null;
    }

    // Better Authクライアントの型をバックエンドのSession型に合わせる
    return response.data as Session;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return null;
  }
});

/**
 * ログインユーザー情報のみを取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @returns ユーザー情報（未認証の場合は null）
 * @throws エラーが発生した場合はログ出力して null を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchUser } from "@/lib/fetcher";
 *
 * export default async function ProfilePage() {
 *   const user = await fetchUser();
 *
 *   if (!user) {
 *     redirect("/sign-in");
 *   }
 *
 *   return <div>Hello, {user.name}!</div>;
 * }
 * ```
 */
export const fetchCurrentUser = cache(async (): Promise<User | null> => {
  const sessionData = await fetchSession();

  if (!sessionData) {
    return null;
  }

  return sessionData.user;
});

/**
 * セッション情報のみを取得
 *
 * サーバーコンポーネント専用の関数
 * React の cache でリクエスト内でメモ化される
 *
 * @returns セッション情報（未認証の場合は null）
 * @throws エラーが発生した場合はログ出力して null を返す
 *
 * @example
 * ```tsx
 * // Server Component
 * import { fetchSession } from "@/lib/fetcher";
 *
 * export default async function SessionDebugPage() {
 *   const session = await fetchSession();
 *
 *   if (!session) {
 *     return <div>Not authenticated</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Session ID: {session.id}</p>
 *       <p>Expires: {session.expiresAt.toISOString()}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const fetchCurrentSession = cache(async (): Promise<SessionData | null> => {
  const sessionData = await fetchSession();

  if (!sessionData) {
    return null;
  }

  return sessionData.session;
});
