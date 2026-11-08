import { useCallback, useRef, useState } from "react";
import { Paperclip, FileText, X } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

// Uploads files to the platform files service; returns stored file records.
export async function uploadFiles(fileList, context = "") {
  const uploaded = [];
  for (const file of Array.from(fileList)) {
    const form = new FormData();
    form.append("file", file);
    form.append("context", context);
    const res = await fetch(`${API}/api/files`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${file.name}`);
    uploaded.push(await res.json());
  }
  return uploaded;
}

export function FileUpload({ context = "", onUploaded, compact = false, testid = "file-upload" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = useCallback(() => inputRef.current?.click(), []);

  const handle = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFiles(files, context);
      onUploaded?.(uploaded);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handle}
        data-testid={`${testid}-input`}
        aria-label="Upload files"
      />
      <button
        type="button"
        onClick={pick}
        disabled={busy}
        data-testid={testid}
        aria-label={busy ? "Uploading…" : "Attach a file"}
        title={busy ? "Uploading…" : "Attach a file"}
        className={
          compact
            ? "grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-50"
            : "inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2 text-[12px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] disabled:opacity-50"
        }
      >
        <Paperclip size={compact ? 15 : 13} aria-hidden="true" />
        {!compact && (busy ? "Uploading…" : "Attach file")}
      </button>
      {error && <span className="text-[11px] text-[#F0707B]" role="alert">{error}</span>}
    </span>
  );
}

export function FileChip({ file, onRemove, testid }) {
  return (
    <span
      data-testid={testid || `file-chip-${file.id}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--electric)]/30 bg-[var(--electric)]/10 px-3 py-1 text-[11px] text-[var(--ink)]"
    >
      <FileText size={12} className="text-[var(--accent)]" aria-hidden="true" />
      <span className="max-w-[140px] truncate">{file.original_filename}</span>
      {onRemove && (
        <button type="button" onClick={() => onRemove(file)} aria-label={`Remove ${file.original_filename}`}
          className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
          <X size={11} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
