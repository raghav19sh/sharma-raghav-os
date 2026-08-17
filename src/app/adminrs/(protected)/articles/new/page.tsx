import { AdminContentForm, type FieldConfig } from "@/components/admin/AdminContentForm";
import { createArticleAction } from "../actions";

const FIELDS: FieldConfig[] = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug", hint: "lowercase-with-hyphens" },
  { name: "kind", label: "Kind", hint: "e.g. Essay, Field Notes, Guide" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "body", label: "Body", type: "textarea", rows: 10 },
  { name: "read_time_minutes", label: "Read time (minutes)", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
  { name: "visibility", label: "Visibility", type: "select", options: ["private", "unlisted", "public"], defaultValue: "private" },
];

export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">New article</h1>
      <AdminContentForm action={createArticleAction} fields={FIELDS} />
    </div>
  );
}
