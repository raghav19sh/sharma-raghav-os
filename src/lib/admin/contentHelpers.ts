import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodSchema } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { writeAuditLog } from "@/lib/audit";
import { writeActivityEvent, describeActivity } from "@/lib/activity";
import type { SlugContentTable } from "@/types/database";

/**
 * Shared logic for the four slug-content tables (projects/articles/
 * journal_entries; research predates this and has its own file, kept
 * as-is). These are plain async functions, NOT themselves Server Actions —
 * Next's "use server" action registration is per statically-exported
 * top-level function, so a factory that returns closures is not a
 * reliable pattern here. Each content type instead gets a thin, explicitly
 * exported "use server" wrapper (see src/app/admin/(protected)/*\/actions.ts)
 * that calls into these. Duplication is three or four lines per type, not
 * the whole CRUD implementation.
 */

export type FormState = { error?: string } | undefined;

interface ContentOptions {
  numericFields?: string[];
  arrayFields?: string[];
  publicPath: string;
  adminPath: string;
}

function coerceFormData(formData: FormData, options: ContentOptions): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value === "") { out[key] = null; continue; }
    out[key] = options.numericFields?.includes(key) ? Number(value) : value;
  }
  for (const field of options.arrayFields ?? []) {
    if (typeof out[field] === "string") {
      out[field] = (out[field] as string).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return out;
}

export async function createContent(
  table: SlugContentTable,
  schema: ZodSchema,
  options: ContentOptions,
  formData: FormData
): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = schema.safeParse(coerceFormData(formData, options));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from(table).insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await writeAuditLog(supabase, { actorId: user.id, action: "create", resourceTable: table, resourceId: data.id });
  if (parsed.data.visibility === "public" && parsed.data.status === "published") {
    await writeActivityEvent(supabase, describeActivity(table, "created", data.title));
  }

  revalidatePath(options.publicPath);
  revalidatePath(options.adminPath);
  redirect(options.adminPath);
}

export async function updateContent(
  table: SlugContentTable,
  schema: ZodSchema,
  options: ContentOptions,
  id: string,
  formData: FormData
): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = schema.safeParse(coerceFormData(formData, options));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from(table).update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, { actorId: user.id, action: "update", resourceTable: table, resourceId: id });
  if (parsed.data.visibility === "public" && parsed.data.status === "published") {
    await writeActivityEvent(supabase, describeActivity(table, "updated", parsed.data.title as string));
  }

  revalidatePath(options.publicPath);
  revalidatePath(options.adminPath);
  redirect(options.adminPath);
}

export async function deleteContent(table: SlugContentTable, options: ContentOptions, id: string): Promise<void> {
  const user = await requireAdmin();
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, { actorId: user.id, action: "delete", resourceTable: table, resourceId: id });
  revalidatePath(options.publicPath);
  revalidatePath(options.adminPath);
}
