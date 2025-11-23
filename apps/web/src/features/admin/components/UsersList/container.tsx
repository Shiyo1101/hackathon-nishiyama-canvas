"use client";

import type { User } from "@api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UsersListPresentation } from "./presentation";

type UserRole = "user" | "admin";

export const UsersListContainer = (): React.JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [selectedBannedStatus, setSelectedBannedStatus] = useState<boolean | "all">("all");

  const fetchUsers = async (role?: UserRole, banned?: boolean) => {
    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = new URL(`${baseUrl}/api/admin/users`);

      if (role) {
        url.searchParams.set("role", role);
      }
      if (typeof banned === "boolean") {
        url.searchParams.set("banned", String(banned));
      }
      url.searchParams.set("limit", "100");
      url.searchParams.set("offset", "0");

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("ユーザーの取得に失敗しました");
      }

      const data = await response.json();
      setUsers(data.data.users);
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
      toast.error("ユーザーの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchUsers is stable
  useEffect(() => {
    const role = selectedRole === "all" ? undefined : selectedRole;
    const banned = selectedBannedStatus === "all" ? undefined : selectedBannedStatus;
    fetchUsers(role, banned);
  }, [selectedRole, selectedBannedStatus]);

  const handleRoleChange = (role: UserRole | "all") => {
    setSelectedRole(role);
  };

  const handleBannedStatusChange = (banned: boolean | "all") => {
    setSelectedBannedStatus(banned);
  };

  const handleUpdateUser = async (
    userId: string,
    updates: { role?: UserRole; banned?: boolean },
  ) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/users/${userId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("ユーザー情報の更新に失敗しました");
      }

      toast.success("ユーザー情報を更新しました");

      // リフレッシュ
      const role = selectedRole === "all" ? undefined : selectedRole;
      const banned = selectedBannedStatus === "all" ? undefined : selectedBannedStatus;
      await fetchUsers(role, banned);
    } catch (error) {
      console.error("ユーザー更新エラー:", error);
      toast.error("ユーザー情報の更新に失敗しました");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("このユーザーを削除してもよろしいですか？")) {
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/users/${userId}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("ユーザーの削除に失敗しました");
      }

      toast.success("ユーザーを削除しました");

      // リフレッシュ
      const role = selectedRole === "all" ? undefined : selectedRole;
      const banned = selectedBannedStatus === "all" ? undefined : selectedBannedStatus;
      await fetchUsers(role, banned);
    } catch (error) {
      console.error("ユーザー削除エラー:", error);
      toast.error("ユーザーの削除に失敗しました");
    }
  };

  return (
    <UsersListPresentation
      users={users}
      isLoading={isLoading}
      selectedRole={selectedRole}
      selectedBannedStatus={selectedBannedStatus}
      onRoleChange={handleRoleChange}
      onBannedStatusChange={handleBannedStatusChange}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
    />
  );
};
