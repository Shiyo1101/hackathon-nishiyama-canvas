import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "./auth.instance";

export const authMiddleware = async (c: Context, next: Next): Promise<void> => {
  try {
    const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });

    if (sessionData?.user && sessionData?.session) {
      c.set("user", sessionData.user);
      c.set("session", sessionData.session);
    } else {
      c.set("user", null);
      c.set("session", null);
    }

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    c.set("user", null);
    c.set("session", null);
    await next();
  }
};

export const requireAuth = async (c: Context, next: Next): Promise<void> => {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized: Authentication required",
    });
  }

  await next();
};

export const requireAdmin = async (c: Context, next: Next): Promise<void> => {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized: Authentication required",
    });
  }

  if (user.role !== "admin") {
    throw new HTTPException(403, {
      message: "Forbidden: Admin privileges required",
    });
  }

  await next();
};

export const optionalAuth = authMiddleware;
