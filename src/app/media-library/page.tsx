import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Media Library", description: "Images, diagrams and video." };
export const revalidate = 60;

export default async function MediaLibraryPage() {
  const supabase = createServerSupabaseClient();
  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><ImageIcon size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Media Library</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Real files, served from Supabase Storage. No embedded/base64 media in the database (§24).</p>
        </div>
      </div>

      {!media || media.length === 0 ? (
        <EmptyState title="No public media yet" text="Upload files in Admin OS — metadata lives in Postgres, the file itself lives in Storage." />
      ) : (
        <div className="grid grid-cols-4 gap-3.5 max-[980px]:grid-cols-2">
          {media.map((m) => {
            const { data: pub } = supabase.storage.from("media").getPublicUrl(m.storage_path);
            return (
              <div key={m.id} className="bg-surface border border-border rounded-card overflow-hidden">
                {m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pub.publicUrl} alt={m.alt_text ?? m.title} className="w-full aspect-[200/130] object-cover" />
                ) : (
                  <div className="w-full aspect-[200/130] bg-bg flex items-center justify-center text-text-2 text-[12px]">{m.kind}</div>
                )}
                <div className="p-2.5">
                  <div className="text-[12.5px] font-medium text-text-1 truncate">{m.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
