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

    read_time_minutes: (() => {
      const value = formData.get("read_time_minutes");

      console.log("READ TIME RECEIVED:", value);

      if (value === null || value === "") {
        return null;
      }

      return Number(value);
    })(),

    status: formData.get("status"),
    visibility: formData.get("visibility"),

    pdf_storage_path:
      String(formData.get("pdf_storage_path") ?? "") || null,

    pdf_filename:
      String(formData.get("pdf_filename") ?? "") || null,

    pdf_size_bytes: formData.get("pdf_size_bytes")
      ? Number(formData.get("pdf_size_bytes"))
      : null,

    pdf_mime_type:
      String(formData.get("pdf_mime_type") ?? "") || null,
  };
}

function parseTags(formData: FormData): string[] {
  const raw = String(formData.get("tags") ?? "");

  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function moveResearchPdf(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  researchId: string,
  storagePath: string,
  filename: string | null
) {
  /*
   * Already in permanent storage — nothing to move.
   */
  if (storagePath.startsWith(`research/${researchId}/`)) {
    return storagePath;
  }

  const safeFilename =
    (filename || storagePath.split("/").pop() || "manuscript.pdf")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

  const permanentPath =
    `research/${researchId}/${safeFilename}`;

  /*
   * Move the object inside the same Supabase Storage bucket.
   */
  const { error: moveError } = await supabase.storage
    .from("research-pdfs")
    .move(storagePath, permanentPath);

  if (moveError) {
    throw new Error(
      `Unable to move research PDF: ${moveError.message}`
    );
  }

  return permanentPath;
}

export async function createResearchAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const user = await requireAdmin();

  const parsed = researchInputSchema.safeParse(
    parseFormData(formData)
  );

  if (!parsed.success) {
    return {
      error: parsed.error.issues
        .map((i) => i.message)
        .join(", "),
    };
  }

  const supabase = await createServerSupabaseClient();

  /*
   * First create the research record.
   */
  const { data, error } = await supabase
    .from("research")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  /*
   * Then move the temporary PDF into its permanent
   * research-specific location.
   */
  if (parsed.data.pdf_storage_path) {
    try {
      const permanentPath = await moveResearchPdf(
        supabase,
        data.id,
        parsed.data.pdf_storage_path,
        parsed.data.pdf_filename ?? null 
      );

      const { error: pdfUpdateError } = await supabase
        .from("research")
        .update({
          pdf_storage_path: permanentPath,
        })
        .eq("id", data.id);

      if (pdfUpdateError) {
        return {
          error: pdfUpdateError.message,
        };
      }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Unable to finalize research PDF.",
      };
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
      describeActivity(
        "research",
        "created",
        data.title
      )
    );
  }

  revalidatePath("/research");
  revalidatePath("/adminrs/research");

  redirect("/adminrs/research");
}

export async function updateResearchAction(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const user = await requireAdmin();

  const parsed = researchInputSchema.safeParse(
    parseFormData(formData)
  );

  if (!parsed.success) {
    return {
      error: parsed.error.issues
        .map((i) => i.message)
        .join(", "),
    };
  }

  const supabase = await createServerSupabaseClient();

  /*
   * If a new temporary PDF was uploaded while editing,
   * move it into the permanent research directory.
   */
  let updateData = { ...parsed.data };

  if (parsed.data.pdf_storage_path) {
    try {
      const permanentPath = await moveResearchPdf(
        supabase,
        id,
        parsed.data.pdf_storage_path,
        parsed.data.pdf_filename ?? null 
      );

      updateData = {
        ...parsed.data,
        pdf_storage_path: permanentPath,
      };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Unable to finalize research PDF.",
      };
    }
  }

  const { error } = await supabase
    .from("research")
    .update(updateData)
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
      describeActivity(
        "research",
        "updated",
        parsed.data.title
      )
    );
  }

  revalidatePath("/research");
  revalidatePath("/adminrs/research");

  redirect("/adminrs/research");
}

export async function deleteResearchAction(
  id: string
) {
  const user = await requireAdmin();

  const supabase =
    await createServerSupabaseClient();

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
  revalidatePath("/adminrs/research");
}