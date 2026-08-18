"use client";

import { useEffect, useMemo, useState } from "react";
import { Hash, Key, FileText, Lock, Copy, Check, AlertCircle, Eye, EyeOff, Search, ShieldCheck } from "lucide-react";

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


function looksLikeBase64(value: string): boolean {
  const compact = value.replace(/\s+/g, "");
  if (compact.length < 8 || compact.length % 4 === 1) return false;
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) return false;
  try {
    const binary = atob(compact);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decoded.length > 0 && Array.from(decoded).every((c) => {
      const code = c.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    });
  } catch { return false; }
}

function decodeHex(value: string): string {
  const compact = value.replace(/\s+/g, "");
  if (compact.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(compact)) throw new Error("Invalid hexadecimal input.");
  const bytes = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) bytes[i / 2] = Number.parseInt(compact.slice(i, i + 2), 16);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

async function digestHex(algorithm: "SHA-1" | "SHA-256" | "SHA-512", text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

type CipherAnalysis = {
  format: string; type: string; confidence: string; detail: string;
  decoded?: string; hashAlgorithm?: "SHA-1" | "SHA-256" | "SHA-512";
};

function analyzeCipherInput(raw: string): CipherAnalysis {
  const value = raw.trim();
  if (!value) return { format: "—", type: "—", confidence: "—", detail: "Paste something to analyze." };

  const parts = value.split(".");
  if (parts.length === 3) {
    const headerSegment = parts[0];
    const payloadSegment = parts[1];

    if (headerSegment && payloadSegment) {
      try {
        const header = JSON.parse(base64UrlDecode(headerSegment));
        const payload = JSON.parse(base64UrlDecode(payloadSegment));
        return {
          format: "JWT",
          type: "JSON Web Token",
          confidence: "High",
          detail: "Three dot-separated segments with valid base64url JSON in the header and payload.",
          decoded: JSON.stringify({ header, payload }, null, 2),
        };
      } catch {}
    }
  }

  const compact = value.replace(/\s+/g, "");
  if (/^[0-9a-fA-F]+$/.test(compact) && compact.length >= 8 && compact.length % 2 === 0) {
    const hashByLength: Record<number, string> = { 32: "MD5 / NTLM candidate", 40: "SHA-1 candidate", 64: "SHA-256 candidate", 128: "SHA-512 candidate" };
    const hashType = hashByLength[compact.length];

    if (hashType) {
      return {
        format: "Hexadecimal digest",
        type: hashType,
        confidence: "Candidate",
        detail: "Hash algorithms can share the same visible format. Length and character set alone cannot prove which algorithm generated it.",
        hashAlgorithm:
          compact.length === 40
            ? "SHA-1"
            : compact.length === 64
              ? "SHA-256"
              : compact.length === 128
                ? "SHA-512"
                : undefined,
      };
    }
    try {
      return { format: "Hexadecimal", type: "Encoded binary/text data", confidence: "Likely", detail: "Valid hexadecimal. If it represents text, it can be decoded locally.", decoded: decodeHex(compact) };
    } catch {
      return { format: "Hexadecimal", type: "Binary data", confidence: "Likely", detail: "Valid hexadecimal, but it does not decode cleanly as UTF-8 text." };
    }
  }

  if (looksLikeBase64(compact)) {
    try { return { format: "Base64", type: "Encoded data", confidence: "High", detail: "Valid Base64 containing readable UTF-8 data.", decoded: decodeBase64(compact) }; }
    catch {}
  }

  if (/%[0-9A-Fa-f]{2}/.test(value)) {
    try { return { format: "URL encoding", type: "Percent-encoded data", confidence: "Candidate", detail: "Contains percent-encoded bytes commonly used in URLs.", decoded: decodeURIComponent(value) }; }
    catch {}
  }

  return { format: "Unknown", type: "No confident match", confidence: "Low", detail: "CipherScope could not confidently identify the input from its structure alone." };
}

function CipherScopeTool() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<CipherAnalysis | null>(null);
  const [candidate, setCandidate] = useState("");
  const [verification, setVerification] = useState("");
  const [copied, setCopied] = useState(false);

  const runAnalysis = () => { setVerification(""); setAnalysis(analyzeCipherInput(input)); };

  const verifyHash = async () => {
    if (!analysis?.hashAlgorithm || !candidate.trim() || !input.trim()) { setVerification("Enter a candidate plaintext first."); return; }
    try {
      const expected = input.replace(/\s+/g, "").toLowerCase();
      const actual = await digestHex(analysis.hashAlgorithm, candidate);
      setVerification(actual === expected
        ? `Match confirmed — ${analysis.hashAlgorithm} of the candidate produces this digest.`
        : `No match — the candidate does not produce the supplied ${analysis.hashAlgorithm} digest.`);
    } catch { setVerification("Could not verify this candidate locally."); }
  };

  const copyDecoded = () => {
    if (!analysis?.decoded) return;
    navigator.clipboard.writeText(analysis.decoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-[18px] flex flex-col gap-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Search size={16} /></div>
        <div>
          <div className="flex items-center gap-2 text-[15px] font-semibold text-text-1">
            <span>CipherScope</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg border border-border text-text-2 uppercase tracking-wide">Local</span>
          </div>
          <p className="text-[12px] text-text-2 leading-relaxed mt-0.5">Universal Crypto Analyzer — identify, decode, inspect, and verify encoded or hashed data. CipherScope does not decrypt one-way hashes.</p>
        </div>
      </div>
      <textarea className="w-full min-h-[120px] bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[13px] font-mono text-text-1 resize-y" value={input} onChange={(e) => { setInput(e.target.value); setAnalysis(null); setVerification(""); }} placeholder="Paste encoded, hashed, encrypted, or token data…" aria-label="CipherScope input" />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={runAnalysis} className="px-4 py-2 rounded-lg bg-lavender text-on-lavender text-[12.5px] font-semibold">Analyze</button>
        <button type="button" onClick={() => { setInput(""); setAnalysis(null); setCandidate(""); setVerification(""); }} className="px-4 py-2 rounded-lg border border-border bg-surface text-text-2 text-[12.5px]">Clear</button>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-status-green-text"><ShieldCheck size={14} />Local analysis — nothing is uploaded</span>
      </div>
      {analysis && (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 max-[760px]:grid-cols-1">
          <div className="bg-bg border border-border rounded-[10px] p-3">
            <div className="text-[10.5px] font-semibold text-text-2 uppercase tracking-wide mb-2">Detection</div>
            <div className="grid grid-cols-[90px_1fr] gap-y-2 text-[12px]">
              <span className="text-text-2">Format</span><span className="font-medium text-text-1 break-words">{analysis.format}</span>
              <span className="text-text-2">Likely type</span><span className="font-medium text-text-1 break-words">{analysis.type}</span>
              <span className="text-text-2">Confidence</span><span className="font-medium text-text-1">{analysis.confidence}</span>
            </div>
            <p className="text-[11.5px] text-text-2 leading-relaxed mt-3">{analysis.detail}</p>
          </div>
          <div className="bg-bg border border-border rounded-[10px] p-3">
            <div className="flex items-center justify-between gap-2 mb-2"><div className="text-[10.5px] font-semibold text-text-2 uppercase tracking-wide">Analysis</div>{analysis.decoded && <button type="button" onClick={copyDecoded} className="w-8 h-8 rounded-btn border border-border bg-surface flex items-center justify-center" aria-label="Copy decoded result">{copied ? <Check size={14} /> : <Copy size={14} />}</button>}</div>
            {analysis.decoded ? <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap break-words text-[12px] font-mono text-text-1">{analysis.decoded}</pre> : <p className="text-[12px] text-text-2 leading-relaxed">{analysis.type.includes("candidate") ? "This is a one-way hash candidate. It cannot be decrypted. Verify a plaintext candidate by hashing it locally and comparing the digest." : "No reversible representation was confidently detected."}</p>}
            {analysis.hashAlgorithm && <div className="mt-4 pt-3 border-t border-border"><div className="text-[10.5px] font-semibold text-text-2 uppercase tracking-wide mb-2">Verify candidate</div><div className="flex gap-2 max-[640px]:flex-col"><input type="text" value={candidate} onChange={(e) => setCandidate(e.target.value)} placeholder="Candidate plaintext…" className="flex-1 bg-surface border border-border rounded-[10px] px-3 py-2 text-[12px] font-mono text-text-1" /><button type="button" onClick={verifyHash} className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text-1 text-[12px] font-semibold">Verify</button></div>{verification && <div className="flex items-start gap-1.5 mt-2 text-[11.5px] text-text-2">{verification.includes("Match confirmed") ? <Check size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}<span>{verification}</span></div>}</div>}
          </div>
        </div>
      )}
    </div>
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
      <CipherScopeTool />
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