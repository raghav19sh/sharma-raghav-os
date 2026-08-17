import { z } from "zod";

/**
 * Shared validation for the four "slug content" tables. Every admin
 * mutation and every API route parses input through one of these before
 * touching the database — never trust client-side validation alone (§41).
 */

export const visibilitySchema = z.enum(["public", "unlisted", "private"]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const researchInputSchema = z.object({
  slug: z.string().regex(slugPattern, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(3).max(200),
  kind: z.enum(["Paper", "Whitepaper", "Research Note", "Draft"]),
  summary: z.string().max(500).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  read_time_minutes: z.number().int().min(1).max(180).optional().nullable(),
  status: z.enum(["draft", "researching", "review", "preprint", "submitted", "under_review", "accepted", "published", "rejected", "archived"]),
  visibility: visibilitySchema,
  pdf_storage_path: z.string().max(500).optional().nullable(),
  pdf_filename: z.string().max(255).optional().nullable(),
  pdf_size_bytes: z.number().int().positive().max(20 * 1024 * 1024).optional().nullable(),
  pdf_mime_type: z.literal("application/pdf").optional().nullable(),
});
export type ResearchInput = z.infer<typeof researchInputSchema>;

export const projectInputSchema = z.object({
  slug: z.string().regex(slugPattern),
  title: z.string().min(3).max(200),
  kind: z.string().max(60).optional().nullable(),
  summary: z.string().max(500).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  repo_url: z.string().url().optional().nullable(),
  live_url: z.string().url().optional().nullable(),
  stack: z.array(z.string().max(40)).max(20).default([]),
  status: z.enum(["idea", "active", "paused", "completed", "archived"]),
  visibility: visibilitySchema,
  started_at: z.string().date().optional().nullable(),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

export const articleInputSchema = z.object({
  slug: z.string().regex(slugPattern),
  title: z.string().min(3).max(200),
  kind: z.string().max(60).optional().nullable(),
  summary: z.string().max(500).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  read_time_minutes: z.number().int().min(1).max(180).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: visibilitySchema,
});
export type ArticleInput = z.infer<typeof articleInputSchema>;

export const journalInputSchema = z.object({
  slug: z.string().regex(slugPattern),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  // Defaults to private on purpose — an admin has to deliberately choose
  // 'public' for an entry to ever leave the admin UI. See §21.
  visibility: visibilitySchema.default("private"),
});
export type JournalInput = z.infer<typeof journalInputSchema>;

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
