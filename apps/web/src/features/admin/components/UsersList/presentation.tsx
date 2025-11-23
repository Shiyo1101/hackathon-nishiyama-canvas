import type { User } from "@api";
import { format } from "date-fns";
import { TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserRole = "user" | "admin";

type UserWithBanned = User & {
  banned?: boolean;
};

type UsersListPresentationProps = {
  users: UserWithBanned[];
  isLoading: boolean;
  selectedRole: UserRole | "all";
  selectedBannedStatus: boolean | "all";
  onRoleChange: (role: UserRole | "all") => void;
  onBannedStatusChange: (banned: boolean | "all") => void;
  onUpdateUser: (userId: string, updates: { role?: UserRole; banned?: boolean }) => void;
  onDeleteUser: (userId: string) => void;
};

const ROLE_LABELS: Record<UserRole | "all", string> = {
  all: "すべて",
  user: "一般ユーザー",
  admin: "管理者",
};

export const UsersListPresentation = ({
  users,
  isLoading,
  selectedRole,
  selectedBannedStatus,
  onRoleChange,
  onBannedStatusChange,
  onUpdateUser,
  onDeleteUser,
}: UsersListPresentationProps): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex gap-2">
            <span className="text-muted-foreground text-sm">権限:</span>
            {(["all", "user", "admin"] as const).map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => onRoleChange(role)}
              >
                {ROLE_LABELS[role]}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground text-sm">状態:</span>
            {(
              [
                { value: "all", label: "すべて" },
                { value: false, label: "アクティブ" },
                { value: true, label: "停止中" },
              ] as const
            ).map((item) => (
              <Button
                key={String(item.value)}
                variant={selectedBannedStatus === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => onBannedStatusChange(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">全 {users.length} 人のユーザー</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>権限</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  ユーザーがいません
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "未設定"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                      {user.role === "user" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateUser(user.id, { role: "admin" })}
                        >
                          管理者に変更
                        </Button>
                      )}
                      {user.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateUser(user.id, { role: "user" })}
                        >
                          一般に変更
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={user.banned ? "destructive" : "default"}>
                        {user.banned ? "停止中" : "アクティブ"}
                      </Badge>
                      {!user.banned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateUser(user.id, { banned: true })}
                        >
                          停止
                        </Button>
                      )}
                      {user.banned && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateUser(user.id, { banned: false })}
                        >
                          再開
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), "yyyy/MM/dd HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteUser(user.id)}
                      disabled={user.role === "admin"}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
