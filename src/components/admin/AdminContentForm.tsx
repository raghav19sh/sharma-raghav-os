"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { FormState } from "@/lib/admin/contentHelpers";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "url";
  options?: string[];
  hint?: string;
  rows?: number;
  defaultValue?: string | number;
}

type Action = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function AdminContentForm({
  action, fields, submitLabel = "Save",
}: {
  action: Action;
  fields: FieldConfig[];
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-xl">
      {fields.map((f) => (
        <FieldRenderer key={f.name} field={f} />
      ))}

      {state?.error && <div className="text-[12.5px] text-status-red-text bg-status-red-tint rounded-lg px-3 py-2">{state.error}</div>}

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function FieldRenderer({ field }: { field: FieldConfig }) {
  const base = "bg-white border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] text-text-1";
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-text-1">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea name={field.name} defaultValue={field.defaultValue as string} rows={field.rows ?? 4} className={base} />
      ) : field.type === "select" ? (
        <select name={field.name} defaultValue={field.defaultValue as string} className={base}>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          defaultValue={field.defaultValue}
          className={base}
        />
      )}
      {field.hint && <span className="text-[11px] text-text-2">{field.hint}</span>}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-lavender text-on-lavender text-[14px] font-medium py-2.5 rounded-btn disabled:opacity-60 w-fit px-6">
      {pending ? "Saving…" : label}
    </button>
  );
}
