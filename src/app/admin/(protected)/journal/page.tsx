import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAllContentForAdmin } from "@/lib/data/content";
import type { JournalEntry } from "@/types/database";
import { AdminContentList } from "@/components/admin/AdminContentList";
import { deleteJournalAction } from "./actions";

export default async function AdminJournalListPage() {
  const supabase = await createServerSupabaseClient();
  const items = await getAllContentForAdmin<JournalEntry>(supabase, "journal_entries");
  const publicCount = items.filter((i) => i.visibility === "public").length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12.5px] text-text-2 max-w-3xl">
        {publicCount} of {items.length} entries are public. Every new entry defaults to{" "}
        <strong>private</strong> — visibility must be changed deliberately for anything to appear
        on the public site (§21).
      </p>
      <AdminContentList
        items={items.map((j) => ({ id: j.id, title: j.title, status: j.status, visibility: j.visibility }))}
        basePath="/admin/journal"
        deleteAction={deleteJournalAction}
        newLabel="New entry"
      />
    </div>
  );
}
