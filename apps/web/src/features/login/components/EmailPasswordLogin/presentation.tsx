"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const EmailPasswordLogin = () => {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        const errorMessage = result.error.message || "Failed to login";
        setError(errorMessage);
        toast.error(`ログインに失敗しました: ${errorMessage}`);
      } else {
        toast.success("ログインしました");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const errorMessage = "Failed to login";
      setError(errorMessage);
      toast.error(`ログインに失敗しました: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 border-dashed bg-orange-50/50">
      <CardHeader>
        <CardTitle className="text-lg">Dev Login</CardTitle>
        <CardDescription>Login with email and password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={emailId} className="font-medium text-sm">
              Email
            </label>
            <Input
              id={emailId}
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={passwordId} className="font-medium text-sm">
              Password
            </label>
            <Input
              id={passwordId}
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-center text-red-600 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 space-y-2 rounded-lg bg-blue-50 p-3">
          <p className="font-semibold text-sm">Test Account:</p>
          <div className="space-y-1 font-mono text-xs">
            <p>Email: user@example.com</p>
            <p>Password: password</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
