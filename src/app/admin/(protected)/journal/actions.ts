"use server";

import { createContent, updateContent, deleteContent, type FormState } from "@/lib/admin/contentHelpers";
import { journalInputSchema } from "@/lib/validation/content";

const OPTIONS = { publicPath: "/journal", adminPath: "/admin/journal" };

export async function createJournalAction(prevState: FormState, formData: FormData) {
  return createContent("journal_entries", journalInputSchema, OPTIONS, formData);
}
export async function updateJournalAction(id: string, prevState: FormState, formData: FormData) {
  return updateContent("journal_entries", journalInputSchema, OPTIONS, id, formData);
}
export async function deleteJournalAction(id: string) {
  return deleteContent("journal_entries", OPTIONS, id);
}
