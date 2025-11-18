"use client";

import type { User } from "@api";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "../../actions/sign-out-action";

type HeaderPresentationProps = {
  user: User | null;
};

export const HeaderPresentation = ({ user }: HeaderPresentationProps) => {
  return (
    <header className="mx-auto w-full max-w-6xl px-8">
      <nav className="flex h-16 items-center justify-between border-b px-4">
        <Link className="flex items-center justify-center gap-1 font-bold text-xl" href="/">
          <Image src="/images/logo.png" alt="にしやまきゃんばす！ロゴ" width={40} height={40} />
          にしやまきゃんばす！
        </Link>
        {user ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full" size="icon">
              <Link href="/settings">
                <SettingsIcon />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full" size="icon">
                  <Avatar>
                    <AvatarImage src={user.image || ""} alt="User Avatar" />
                    <AvatarFallback>{user.name?.toUpperCase().slice(0, 1) || "🐼"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-50" align="end">
                <DropdownMenuLabel>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-foreground text-xs">{user.email}</p>
                  <p className="text-foreground text-xs">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOutAction();
                  }}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">ログイン</Link>
          </div>
        )}
      </nav>
    </header>
  );
};
