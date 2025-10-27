import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { type AuthenticatedVariables, authMiddleware, requireAuth } from "../auth";
import { createSignageRepository } from "./signage.repository";
import { createSignageService } from "./signage.service";

const signageRepository = createSignageRepository(prisma);
const signageService = createSignageService(signageRepository);

const LayoutConfigSchema = z.object({
  template_id: z.string(),
  background: z.object({
    type: z.enum(["color", "image"]),
    color: z.string().optional(),
    url: z.string().optional(),
  }),
  grid: z
    .object({
      columns: z.number().int().min(1).max(24),
      rows: z.number().int().min(1).max(24),
    })
    .optional(),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["news", "animal", "text", "image", "user_image"]),
      position: z.object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        w: z.number().int().min(1),
        h: z.number().int().min(1),
      }),
      contentId: z.string().optional(),
      settings: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

const CreateSignageRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  layoutConfig: LayoutConfigSchema,
});

const UpdateSignageRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  layoutConfig: LayoutConfigSchema.optional(),
});

const PublishSignageRequestSchema = z.object({
  isPublic: z.boolean(),
});

const serializeSignage = (signage: Awaited<ReturnType<typeof signageService.getUserSignage>>) => {
  if (!signage) return null;
  return {
    ...signage,
    createdAt: signage.createdAt.toISOString(),
    updatedAt: signage.updatedAt.toISOString(),
    layoutConfig: signage.layoutConfig as z.infer<typeof LayoutConfigSchema>,
  };
};

const handleError = (
  error: unknown,
  c: { json: (data: { success: boolean; error: string }, status: number) => Response },
) => {
  if (error instanceof Error) {
    if (error.message.includes("not found")) {
      return c.json({ success: false, error: error.message }, 404);
    }
    if (error.message.includes("already exists")) {
      return c.json({ success: false, error: error.message }, 409);
    }
    return c.json({ success: false, error: error.message }, 500);
  }
  return c.json({ success: false, error: "Unknown error" }, 500);
};

const app = new Hono<{ Variables: AuthenticatedVariables }>()
  .use("*", authMiddleware)
  .use("*", requireAuth)
  .get("/me", async (c) => {
    const user = c.get("user");

    try {
      const signage = await signageService.getUserSignage(user.id);
      const serializedSignage = serializeSignage(signage);

      if (!serializedSignage) {
        return c.json({ success: false, error: "サイネージが見つかりません" }, 404);
      }

      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  })
  .post("/", zValidator("json", CreateSignageRequestSchema), async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    try {
      const signage = await signageService.createSignage(user.id, body);
      const serializedSignage = serializeSignage(signage);

      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }

      return c.json({ success: true, data: { signage: serializedSignage } }, 201);
    } catch (error) {
      return handleError(error, c);
    }
  })
  .put("/:id", zValidator("json", UpdateSignageRequestSchema), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    try {
      const signage = await signageService.updateSignage(user.id, id, body);
      const serializedSignage = serializeSignage(signage);

      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }

      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  })
  .patch("/:id/publish", zValidator("json", PublishSignageRequestSchema), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { isPublic } = c.req.valid("json");

    try {
      const signage = await signageService.updatePublishStatus(user.id, id, isPublic);
      const serializedSignage = serializeSignage(signage);

      if (!serializedSignage) {
        throw new Error("Failed to serialize signage");
      }

      return c.json({ success: true, data: { signage: serializedSignage } }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  })
  .delete("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    try {
      await signageService.deleteSignage(user.id, id);
      return c.json({ success: true }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  });

const publicApp = new Hono().get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const signage = await signageService.getPublicSignage(slug);
    const serializedSignage = serializeSignage(signage);

    if (!serializedSignage) {
      throw new Error("Failed to serialize signage");
    }

    return c.json({ success: true, data: { signage: serializedSignage } }, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

export { app as signageRoutes, publicApp as publicSignageRoutes };
