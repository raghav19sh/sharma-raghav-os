"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { researchInputSchema } from "@/lib/validation/content";
import { writeAuditLog } from "@/lib/audit";
import { writeActivityEvent, describeActivity } from "@/lib/activity";
import { setTagsFor } from "@/lib/data/tags";

function parseFormData(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    kind: formData.get("kind"),
    summary: formData.get("summary") || null,
    body: formData.get("body") || null,
    read_time_minutes: formData.get("read_time_minutes")
      ? Number(formData.get("read_time_minutes"))
      : null,
    status: formData.get("status"),
    visibility: formData.get("visibility"),
    pdf_storage_path: String(formData.get("pdf_storage_path") ?? "") || null,
    pdf_filename: String(formData.get("pdf_filename") ?? "") || null,
    pdf_size_bytes: formData.get("pdf_size_bytes")
      ? Number(formData.get("pdf_size_bytes"))
      : null,
    pdf_mime_type: String(formData.get("pdf_mime_type") ?? "") || null,
  };
}

function parseTags(formData: FormData): string[] {
  const raw = String(formData.get("tags") ?? "");
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createResearchAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const user = await requireAdmin();

  const parsed = researchInputSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("research")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (parsed.data.pdf_storage_path) {
    const filename = parsed.data.pdf_filename ?? "manuscript.pdf";
    const permanentPath = `research/${data.id}/${filename}`;

    const { error: moveError } = await supabase.storage
      .from("research-pdfs")
      .move(parsed.data.pdf_storage_path, permanentPath);

    if (moveError) {
      return { error: moveError.message };
    }

    const { error: pdfUpdateError } = await supabase
      .from("research")
      .update({
        pdf_storage_path: permanentPath,
      })
      .eq("id", data.id);

    if (pdfUpdateError) {
      return { error: pdfUpdateError.message };
    }
  }

  await setTagsFor(
    supabase,
    "research",
    data.id,
    parseTags(formData)
  );

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: "create",
    resourceTable: "research",
    resourceId: data.id,
  });

  if (
    parsed.data.visibility === "public" &&
    parsed.data.status === "published"
  ) {
    await writeActivityEvent(
      supabase,
      describeActivity("research", "created", data.title)
    );
  }

  revalidatePath("/research");
  revalidatePath("/admin/research");

  redirect("/admin/research");
}

export async function updateResearchAction(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const user = await requireAdmin();

  const parsed = researchInputSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("research")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await setTagsFor(
    supabase,
    "research",
    id,
    parseTags(formData)
  );

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: "update",
    resourceTable: "research",
    resourceId: id,
  });

  if (
    parsed.data.visibility === "public" &&
    parsed.data.status === "published"
  ) {
    await writeActivityEvent(
      supabase,
      describeActivity("research", "updated", parsed.data.title)
    );
  }

  revalidatePath("/research");
  revalidatePath("/admin/research");

  redirect("/admin/research");
}

export async function deleteResearchAction(id: string) {
  const user = await requireAdmin();

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("research")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: "delete",
    resourceTable: "research",
    resourceId: id,
  });

  revalidatePath("/research");
  revalidatePath("/admin/research");
}