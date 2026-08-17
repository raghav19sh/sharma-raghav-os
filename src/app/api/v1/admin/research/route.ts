import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { researchInputSchema } from "@/lib/validation/content";
import { writeAuditLog } from "@/lib/audit";

/**
 * middleware.ts already blocks unauthenticated requests to
 * /api/v1/admin/* at the edge. requireAdmin() here is the second,
 * independent check (§11 defense in depth) — this route does not trust
 * that middleware ran, it verifies for itself.
 */
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = researchInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("research").insert(parsed.data).select().single();

  if (error) {
    return NextResponse.json({ error: "Unable to create research entry" }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: "create",
    resourceTable: "research",
    resourceId: data.id,
    request,
  });

  return NextResponse.json({ data }, { status: 201 });
}
