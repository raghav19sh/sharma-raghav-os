"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

type Props = {
  initialPath?: string | null;
  initialFilename?: string | null;
  initialSize?: number | null;
};

export function ResearchPdfUpload({
  initialPath = null,
  initialFilename = null,
  initialSize = null,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [path, setPath] = useState(initialPath);
  const [filename, setFilename] = useState(initialFilename);
  const [size, setSize] = useState(initialSize);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("PDF must be smaller than 20 MB.");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const uniqueId = crypto.randomUUID();

      const storagePath = `temp/${uniqueId}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("research-pdfs")
        .upload(storagePath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setPath(storagePath);
      setFilename(file.name);
      setSize(file.size);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "PDF upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function removePdf() {
    setPath(null);
    setFilename(null);
    setSize(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12.5px] font-medium text-text-1">
        Manuscript PDF
      </span>

      <input
        type="hidden"
        name="pdf_storage_path"
        value={path ?? ""}
      />

      <input
        type="hidden"
        name="pdf_filename"
        value={filename ?? ""}
      />

      <input
        type="hidden"
        name="pdf_size_bytes"
        value={size ?? ""}
      />

      <input
        type="hidden"
        name="pdf_mime_type"
        value={path ? "application/pdf" : ""}
      />

      {!path ? (
        <div className="border border-border rounded-[10px] bg-surface p-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-[13px] font-medium text-text-1">
              Upload research manuscript
            </div>

            <div className="text-[11px] text-text-2">
              PDF only · Maximum 20 MB
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="bg-lavender text-on-lavender text-[13px] font-medium px-4 py-2 rounded-btn disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Choose PDF"}
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleFile(file);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-[10px] bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-text-1 truncate">
                📄 {filename}
              </div>

              <div className="text-[11px] text-text-2 mt-1">
                {formatSize(size)}
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="border border-border text-text-1 text-[12px] px-3 py-1.5 rounded-btn disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Replace"}
              </button>

              <button
                type="button"
                onClick={removePdf}
                className="border border-border text-status-red-text text-[12px] px-3 py-1.5 rounded-btn"
              >
                Remove
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleFile(file);
                }
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="text-[11px] text-status-red-text bg-status-red-tint rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <span className="text-[11px] text-text-2">
        The PDF is stored separately from the web version of the paper.
      </span>
    </div>
  );
}