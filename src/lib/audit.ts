import type { SupabaseClient } from "@supabase/supabase-js";

interface AuditParams {
  actorId: string;
  action: "login" | "logout" | "create" | "update" | "delete" | "publish" | "unpublish";
  resourceTable?: string;
  resourceId?: string;
  request?: Request;
}

/**
 * Writes one row to audit_logs. Called from every admin Server Action and
 * every /api/v1/admin/* mutation (§38). Failure to write an audit row
 * should not silently swallow the error — surface it, but don't let it
 * block the underlying action either; log-and-continue is the usual
 * tradeoff here, adjust if your compliance needs are stricter.
 */
export async function writeAuditLog(
  supabase: SupabaseClient,
  params: AuditParams
) {
  const { actorId, action, resourceTable, resourceId, request } = params;

  const { error } = await supabase.from("audit_logs").insert({
    actor: actorId,
    action,
    resource_table: resourceTable ?? null,
    resource_id: resourceId ?? null,
    ip_address: request?.headers.get("x-forwarded-for") ?? null,
    user_agent: request?.headers.get("user-agent") ?? null,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log:", error.message);
  }
}
