"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Research } from "@/types/database";
import { ResearchPdfUpload } from "./ResearchPdfUpload";

type Action = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;

export function ResearchForm({ action, initial, initialTags = "" }: { action: Action; initial?: Partial<Research>; initialTags?: string }) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-xl">
      <Field label="Title" name="title" defaultValue={initial?.title} required />
      <Field label="Slug" name="slug" defaultValue={initial?.slug} required hint="lowercase-with-hyphens" />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Kind" name="kind" defaultValue={initial?.kind} options={["Paper", "Whitepaper", "Research Note", "Draft"]} />
        <Field label="Read time (minutes)" name="read_time_minutes" type="number" defaultValue={initial?.read_time_minutes ?? undefined} />
      </div>
      <Field label="Summary" name="summary" defaultValue={initial?.summary ?? undefined} textarea />
      <Field label="Body" name="body" defaultValue={initial?.body ?? undefined} textarea rows={10} />
      <ResearchPdfUpload
  initialPath={initial?.pdf_storage_path}
  initialFilename={initial?.pdf_filename}
  initialSize={initial?.pdf_size_bytes}
/>
      <Field label="Tags" name="tags" defaultValue={initialTags} hint="comma-separated, e.g. AI Safety, LLM, Security" />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Status" name="status" defaultValue={initial?.status} options={["draft", "researching", "review", "preprint", "submitted", "under_review", "accepted", "published", "rejected", "archived"]} />
        <SelectField label="Visibility" name="visibility" defaultValue={initial?.visibility ?? "private"} options={["private", "unlisted", "public"]} />
      </div>

      {state?.error && <div className="text-[12.5px] text-status-red-text bg-status-red-tint rounded-lg px-3 py-2">{state.error}</div>}

      <SubmitButton />
    </form>
  );
}

function Field({
  label, name, defaultValue, required, textarea, rows = 4, hint, type = "text",
}: {
  label: string; name: string; defaultValue?: string | number; required?: boolean;
  textarea?: boolean; rows?: number; hint?: string; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-text-1">{label}</span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue as string} rows={rows} className="bg-surface border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] text-text-1" />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} required={required} className="bg-surface border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] text-text-1" />
      )}
      {hint && <span className="text-[11px] text-text-2">{hint}</span>}
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-text-1">{label}</span>
      <select name={name} defaultValue={defaultValue} className="bg-surface border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] text-text-1">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-lavender text-on-lavender text-[14px] font-medium py-2.5 rounded-btn disabled:opacity-60 w-fit px-6">
      {pending ? "Saving…" : "Save"}
    </button>
  );
}
