"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validation/admin";
import { writeAuditLog } from "@/lib/audit";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = loginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    // Deliberately generic — don't reveal whether the email exists.
    return { error: "Invalid email or password." };
  }

  const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
  if (data.user.email !== allowedEmail) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized for Admin OS." };
  }

  await writeAuditLog(supabase, { actorId: data.user.id, action: "login" });
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await writeAuditLog(supabase, { actorId: user.id, action: "logout" });
  }
  await supabase.auth.signOut();
  redirect("/admin/login");
}
