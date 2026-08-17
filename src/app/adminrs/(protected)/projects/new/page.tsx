import { AdminContentForm, type FieldConfig } from "@/components/admin/AdminContentForm";
import { createProjectAction } from "../actions";

const FIELDS: FieldConfig[] = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug", hint: "lowercase-with-hyphens" },
  { name: "kind", label: "Kind", hint: "e.g. \"Cybersecurity Project\"" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "body", label: "Body", type: "textarea", rows: 10 },
  { name: "stack", label: "Stack", hint: "comma-separated, e.g. Python, Flask, Ngrok" },
  { name: "repo_url", label: "Repository URL", type: "url" },
  { name: "live_url", label: "Live URL", type: "url" },
  { name: "started_at", label: "Started", hint: "YYYY-MM-DD" },
  { name: "status", label: "Status", type: "select", options: ["idea", "active", "paused", "completed", "archived"] },
  { name: "visibility", label: "Visibility", type: "select", options: ["private", "unlisted", "public"], defaultValue: "private" },
];

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">New project</h1>
      <AdminContentForm action={createProjectAction} fields={FIELDS} />
    </div>
  );
}
