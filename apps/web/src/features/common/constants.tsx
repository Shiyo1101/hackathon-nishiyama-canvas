import { FileTextIcon, ImagesIcon, SettingsIcon, WallpaperIcon } from "lucide-react";
import type { ReactNode } from "react";

export type NavItem = {
  title: string;
  url: string;
  icon: ReactNode;
};

export const NavItems: NavItem[] = [
  {
    title: "マイサイネージ",
    url: "/signage/me",
    icon: <WallpaperIcon />,
  },
  {
    title: "ニュース",
    url: "/news",
    icon: <FileTextIcon />,
  },
  {
    title: "写真一覧",
    url: "/photos",
    icon: <ImagesIcon />,
  },
  {
    title: "設定",
    url: "/settings",
    icon: <SettingsIcon />,
  },
];
