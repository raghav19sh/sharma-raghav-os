"use server";

import { createContent, updateContent, deleteContent, type FormState } from "@/lib/admin/contentHelpers";
import { projectInputSchema } from "@/lib/validation/content";

const OPTIONS = { arrayFields: ["stack"], publicPath: "/engineering", adminPath: "/admin/projects" };

export async function createProjectAction(prevState: FormState, formData: FormData) {
  return createContent("projects", projectInputSchema, OPTIONS, formData);
}
export async function updateProjectAction(id: string, prevState: FormState, formData: FormData) {
  return updateContent("projects", projectInputSchema, OPTIONS, id, formData);
}
export async function deleteProjectAction(id: string) {
  return deleteContent("projects", OPTIONS, id);
}
