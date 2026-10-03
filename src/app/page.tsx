import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStatusSnapshot } from "@/lib/data/status";
import ProzillaDesktop from "@/components/os/ProzillaDesktop";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const supabase = await createServerSupabaseClient();
  const status = await getStatusSnapshot(supabase);
  return <ProzillaDesktop status={status} />;
}
