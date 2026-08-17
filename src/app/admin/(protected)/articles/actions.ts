"use server";

import { createContent, updateContent, deleteContent, type FormState } from "@/lib/admin/contentHelpers";
import { articleInputSchema } from "@/lib/validation/content";

const OPTIONS = { numericFields: ["read_time_minutes"], publicPath: "/knowledge", adminPath: "/admin/articles" };

export async function createArticleAction(prevState: FormState, formData: FormData) {
  return createContent("articles", articleInputSchema, OPTIONS, formData);
}
export async function updateArticleAction(id: string, prevState: FormState, formData: FormData) {
  return updateContent("articles", articleInputSchema, OPTIONS, id, formData);
}
export async function deleteArticleAction(id: string) {
  return deleteContent("articles", OPTIONS, id);
}
