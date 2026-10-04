import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStatusSnapshot } from "@/lib/data/status";
import ProzillaSiteOS from "@/components/os/ProzillaSiteOS";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const supabase = await createServerSupabaseClient();
  const status = await getStatusSnapshot(supabase);
  void status;
  return <ProzillaSiteOS />;
}
