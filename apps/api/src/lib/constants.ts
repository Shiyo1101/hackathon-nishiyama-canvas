// Image upload limits
export const IMAGE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/jpg", "image/png"] as const,
} as const;

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

// Content types
export const CONTENT_TYPES = {
  NEWS: "news",
  ANIMAL: "animal",
  TEXT: "text",
  IMAGE: "image",
  USER_IMAGE: "user_image",
} as const;
