import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStatusSnapshot } from "@/lib/data/status";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const status = await getStatusSnapshot(supabase);
  return NextResponse.json({ data: status });
}
