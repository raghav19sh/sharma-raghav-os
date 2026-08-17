"use client";

import { useEffect, useMemo, useState } from "react";
import { Hash, Key, FileText, Lock, Copy, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

/** All four tools are pure client-side computation. Nothing typed into any
 *  of them is sent to a server or stored anywhere — verified by the
 *  absence of any fetch()/localStorage call in this file. */

function ToolCard({ icon: Icon, title, hint, children }: {
  icon: typeof Hash; title: string; hint: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-card p-[18px] flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5 text-[14px] font-semibold text-text-1">
        <Icon size={16} /><span>{title}</span>
      </div>
      <p className="text-[12px] text-text-2 leading-relaxed">{hint}</p>
      {children}
    </div>
  );
}

function HashTool() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!text) { setHash(""); return; }
    let active = true;
    (async () => {
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      if (active) setHash(hex);
    })();
    return () => { active = false; };
  }, [text]);

  return (
    <ToolCard icon={Hash} title="SHA-256 Hash Generator" hint="Runs entirely in your browser via the Web Crypto API. Nothing you type here is sent anywhere.">
      <textarea
        className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[13px] font-mono text-text-1 resize-y"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text to hash…"
        aria-label="Text to hash"
      />
      <div className="flex items-center gap-2.5 bg-bg border border-border rounded-[10px] px-3 py-2.5">
        <code className="flex-1 font-mono text-[12px] text-text-1 break-all">{hash || "—"}</code>
        <button
          onClick={() => { if (hash) { navigator.clipboard.writeText(hash); setCopied(true); setTimeout(() => setCopied(false), 1400); } }}
          disabled={!hash}
          className="w-9 h-9 rounded-btn border border-border bg-surface flex items-center justify-center disabled:opacity-40"
          aria-label="Copy hash"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </ToolCard>
  );
}

function base64UrlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function JwtTool() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<{ header: unknown; payload: unknown } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token.trim()) { setResult(null); setError(""); return; }
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      setResult(null);
      setError("Not a JWT structurally — expected three dot-separated segments (header.payload.signature).");
      return;
    }
    try {
      const [headerPart, payloadPart] = parts as [string, string, string];
      const header = JSON.parse(base64UrlDecode(headerPart));
      const payload = JSON.parse(base64UrlDecode(payloadPart));
      setResult({ header, payload });
      setError("");
    } catch {
      setResult(null);
      setError("Could not decode — the header/payload segments aren't valid base64url JSON.");
    }
  }, [token]);

  return (
    <ToolCard icon={Key} title="JWT Decoder" hint="Decodes the header and payload only. This tool does NOT verify the signature — a decoded, readable JWT is not the same as a valid one.">
      <textarea
        className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[13px] font-mono text-text-1 resize-y"
        rows={3}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste a JWT…"
        aria-label="JWT to decode"
      />
      {error && <div className="flex items-center gap-1.5 text-[12.5px] text-status-red-text"><AlertCircle size={14} />{error}</div>}
      {result && (
        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <div>
            <div className="text-[11px] font-semibold text-text-2 uppercase tracking-wide mb-1">Header</div>
            <pre className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[11.5px] font-mono text-text-1 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(result.header, null, 2)}</pre>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-text-2 uppercase tracking-wide mb-1">Payload</div>
            <pre className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[11.5px] font-mono text-text-1 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(result.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </ToolCard>
  );
}

function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  // Correct UTF-8 handling (the old unescape/escape trick is deprecated and
  // mangles some multi-byte characters) — TextEncoder/TextDecoder are the
  // real fix called out in §30.
  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        const bytes = new TextEncoder().encode(input);
        const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
        return { output: btoa(binary), error: "" };
      }
      const binary = atob(input);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return { output: new TextDecoder("utf-8").decode(bytes), error: "" };
    } catch {
      return { output: "", error: "That doesn't look like valid base64." };
    }
  }, [input, mode]);

  return (
    <ToolCard icon={FileText} title="Base64 Encode / Decode" hint="Full UTF-8 safe — handles multi-byte characters correctly, not just ASCII.">
      <div className="flex gap-1.5">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-[12.5px] px-3.5 py-1.5 rounded-lg border ${mode === m ? "bg-lavender border-lavender text-on-lavender" : "bg-surface border-border text-text-2"}`}
          >
            {m === "encode" ? "Encode" : "Decode"}
          </button>
        ))}
      </div>
      <textarea
        className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[13px] font-mono text-text-1 resize-y"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Plain text…" : "Base64 text…"}
        aria-label="Base64 input"
      />
      {error && <div className="flex items-center gap-1.5 text-[12.5px] text-status-red-text"><AlertCircle size={14} />{error}</div>}
      <div className="bg-bg border border-border rounded-[10px] px-3 py-2.5">
        <code className="font-mono text-[12px] text-text-1 break-all">{output || "—"}</code>
      </div>
    </ToolCard>
  );
}

function PasswordStrengthTool() {
  const [pw, setPw] = useState("");
  const [visible, setVisible] = useState(false);

  const { score, label, tone } = useMemo(() => {
    if (!pw) return { score: 0, label: "—", tone: "neutral" as const };
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (pw.length < 8) s = Math.min(s, 1);
    const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong", "Excellent"];
    const tones = ["red", "red", "amber", "amber", "green", "green"] as const;
    return { score: s, label: labels[s], tone: tones[s] };
  }, [pw]);

  return (
    <ToolCard icon={Lock} title="Password Strength Estimate" hint="A rough local heuristic, not a real cracking-time estimate. Nothing typed here is saved, logged, or sent anywhere — verify that yourself by checking this file for any fetch/storage call.">
      <div className="relative">
        <input
          // §30 fix: this was a plain text input before, showing the
          // password in the clear by default — real password fields
          // default to masked.
          type={visible ? "text" : "password"}
          className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 pr-10 text-[13px] font-mono text-text-1"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Type a password to test…"
          aria-label="Password to test"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-2"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-normal ${tone === "red" ? "bg-status-red" : tone === "amber" ? "bg-status-amber" : tone === "green" ? "bg-status-green" : "bg-border-strong"}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <div className={`text-[12px] font-semibold ${tone === "red" ? "text-status-red-text" : tone === "amber" ? "text-status-amber-text" : tone === "green" ? "text-status-green-text" : "text-text-2"}`}>
        {label}
      </div>
    </ToolCard>
  );
}

const COMING_SOON = [
  { title: "CIDR Calculator" },
  { title: "HTTP Header Analyzer" },
  { title: "URL Reputation" },
  { title: "DNS Inspection" },
  { title: "Encoding Toolkit" },
];

export function SecurityTools() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 max-[1024px]:grid-cols-1">
        <HashTool />
        <JwtTool />
        <Base64Tool />
        <PasswordStrengthTool />
      </div>
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-wide text-text-2 mb-3">More labs, coming soon</div>
        <div className="grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
          {COMING_SOON.map((c) => (
            <div key={c.title} className="flex items-center justify-between gap-2 p-4 rounded-card border border-dashed border-border-strong text-text-2">
              <span className="text-[13px]">{c.title}</span>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-bg border border-border">Coming soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
