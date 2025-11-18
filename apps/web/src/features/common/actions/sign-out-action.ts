"use server";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export const signOutAction = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        redirect("/login");
      },
    },
  });
};
