import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAllContentForAdmin } from "@/lib/data/content";
import type { Research } from "@/types/database";
import { deleteResearchAction } from "../actions/research";

export default async function AdminResearchListPage() {
  const supabase = await createServerSupabaseClient();
  const items = await getAllContentForAdmin<Research>(supabase, "research");

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-text-1">Research</h1>
        <Link href="/adminrs/research/new" className="bg-lavender text-on-lavender text-[13.5px] font-medium px-4 py-2 rounded-btn">
          New research item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[13.5px] text-text-2">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-surface border border-border rounded-[10px] px-4 py-3">
              <span className="flex-1 text-[13.5px] text-text-1">{item.title}</span>
              <span className="text-[11px] text-text-2 capitalize">{item.status}</span>
              <span className="text-[11px] text-text-2 capitalize">{item.visibility}</span>
              <Link href={`/adminrs/research/${item.id}/edit`} className="text-[12.5px] text-lavender">Edit</Link>
              <form
                action={async () => {
                  "use server";
                  await deleteResearchAction(item.id);
                }}
              >
                <button className="text-[12.5px] text-status-red-text">Delete</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
