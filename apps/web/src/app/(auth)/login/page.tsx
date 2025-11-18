import type { Metadata } from "next";
import Image from "next/image";
import { EmailPasswordLogin } from "@/features/login/components/EmailPasswordLogin";
import { SocialLogin } from "@/features/login/components/SocialLogin";

export const metadata: Metadata = {
  title: "ログイン - にしやまきゃんばす",
  description: "西山動物園のレッサーパンダをテーマにしたデジタルサイネージ作成アプリケーション",
};

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-background">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7bba1' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="z-10 flex w-full max-w-md flex-col px-4 py-10">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 h-30 w-30 overflow-hidden rounded-full bg-primary/20">
            <Image
              src="/images/logo.png"
              alt="logo"
              width={120}
              height={120}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-black text-2xl text-foreground leading-tight tracking-tighter">
              にしやまきゃんばす！へようこそ
            </h1>
            <p className="text-muted-foreground">サインインして続行してください</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* 開発環境用: メール・パスワードログイン */}
          {process.env.NODE_ENV === "development" && (
            <>
              <EmailPasswordLogin />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-border border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">または</span>
                </div>
              </div>
            </>
          )}

          {/* ソーシャルログイン */}
          <div className="flex flex-col gap-3">
            <SocialLogin provider="google" className="h-14 w-full" />
            <SocialLogin provider="discord" className="h-14 w-full" />
            <SocialLogin provider="line" className="h-14 w-full" />
          </div>
        </div>
      </div>

      <div className="fixed right-4 bottom-4 z-10 text-muted-foreground text-xs">
        <p>© 2025 Nishiyama Canvas. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginPage;
