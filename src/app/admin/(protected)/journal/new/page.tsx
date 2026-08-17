import { AlertCircle } from "lucide-react";
import { AdminContentForm, type FieldConfig } from "@/components/admin/AdminContentForm";
import { createJournalAction } from "../actions";

const FIELDS: FieldConfig[] = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug", hint: "lowercase-with-hyphens" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "body", label: "Body", type: "textarea", rows: 12 },
  { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
  {
    name: "visibility", label: "Visibility", type: "select",
    options: ["private", "unlisted", "public"], defaultValue: "private",
    hint: "Defaults to private on purpose. Only 'public' entries can ever appear on the public site.",
  },
];

export default function NewJournalPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">New journal entry</h1>
      <div className="flex items-center gap-2 text-[12.5px] text-status-amber-text bg-status-amber-tint rounded-lg px-3.5 py-2.5 max-w-xl">
        <AlertCircle size={14} />
        This entry is private until you explicitly set Visibility to &quot;public&quot; below.
      </div>
      <AdminContentForm action={createJournalAction} fields={FIELDS} />
    </div>
  );
}
