import { FileTextIcon, ImageIcon, ShieldAlertIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AdminNavItem = {
  title: string;
  url: string;
  icon: ReactNode;
};

export const AdminNavItems: AdminNavItem[] = [
  {
    title: "ニュース管理",
    url: "/admin/news",
    icon: <FileTextIcon />,
  },
  {
    title: "動物情報管理",
    url: "/admin/animals",
    icon: <ImageIcon />,
  },
  {
    title: "通報管理",
    url: "/admin/reports",
    icon: <ShieldAlertIcon />,
  },
  {
    title: "ユーザー管理",
    url: "/admin/users",
    icon: <UsersIcon />,
  },
];
