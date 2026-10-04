"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Copy, Eye, EyeOff, FileText, Hash, KeyRound, Lock, Search, ShieldCheck } from "lucide-react";

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function base64UrlDecode(value: string) {
  const compact = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = compact + "=".repeat((4 - (compact.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function looksLikeBase64(value: string) {
  const compact = value.replace(/\s+/g, "");
  if (compact.length < 8 || compact.length % 4 === 1) return false;
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) return false;
  try {
    const binary = atob(compact);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decoded.length > 0 && Array.from(decoded).every((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    });
  } catch {
    return false;
  }
}

async function digest(algorithm: "SHA-1" | "SHA-256" | "SHA-512", input: string) {
  return bytesToHex(await crypto.subtle.digest(algorithm, new TextEncoder().encode(input)));
}

type ToolId = "hash" | "jwt" | "base64" | "password" | "cipher";

export default function SecurityTools() {
  const [tool, setTool] = useState<ToolId>("hash");

  return (
    <div className="lab">
      <div className="lab-tabs" role="tablist" aria-label="Security tools">
        {[
          ["hash", "Hash"],
          ["jwt", "JWT"],
          ["base64", "Base64"],
          ["password", "Password"],
          ["cipher", "CipherScope"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tool === id ? "lab-tab is-active" : "lab-tab"}
            onClick={() => setTool(id as ToolId)}
          >
            {label}
          </button>
        ))}
      </div>

      {tool === "hash" && <HashTool />}
      {tool === "jwt" && <JwtTool />}
      {tool === "base64" && <Base64Tool />}
      {tool === "password" && <PasswordTool />}
      {tool === "cipher" && <CipherScopeTool />}

      <div className="lab-safe">
        <ShieldCheck size={14} />
        Local-only analysis — nothing typed into these tools is uploaded or stored.
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, hint, children }: { icon: typeof Hash; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="lab-panel">
      <div className="lab-panel-head">
        <div className="lab-icon"><Icon size={16} /></div>
        <div>
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function HashTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<"SHA-256" | "SHA-1" | "SHA-512">("SHA-256");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setHash("");
      return;
    }
    void digest(algorithm, input).then((value) => {
      if (!cancelled) setHash(value);
    });
    return () => { cancelled = true; };
  }, [algorithm, input]);

  return (
    <Panel icon={Hash} title="Hash Generator" hint="Browser Web Crypto API. Choose the digest and type a value.">
      <div className="lab-row">
        <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as typeof algorithm)}>
          <option>SHA-256</option>
          <option>SHA-1</option>
          <option>SHA-512</option>
        </select>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Text to hash…" aria-label="Text to hash" />
      </div>
      <div className="lab-output">
        <code>{hash || "—"}</code>
        <button type="button" disabled={!hash} onClick={() => { if (hash) { void navigator.clipboard.writeText(hash); setCopied(true); window.setTimeout(() => setCopied(false), 1200); } }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </Panel>
  );
}

function JwtTool() {
  const [token, setToken] = useState("");
  const { result, error } = useMemo(() => {
    if (!token.trim()) return { result: null as null | { header: unknown; payload: unknown }, error: "" };
    const parts = token.trim().split(".");
    if (parts.length !== 3) return { result: null, error: "JWT structure: header.payload.signature" };
    try {
      return {
        result: {
          header: JSON.parse(base64UrlDecode(parts[0] ?? "")),
          payload: JSON.parse(base64UrlDecode(parts[1] ?? "")),
        },
        error: "",
      };
    } catch {
      return { result: null, error: "Header/payload could not be decoded as base64url JSON." };
    }
  }, [token]);

  return (
    <Panel icon={KeyRound} title="JWT Decoder" hint="Decodes header and payload only; it does not verify the signature.">
      <textarea value={token} onChange={(event) => setToken(event.target.value)} rows={4} placeholder="Paste a JWT…" />
      {error && <div className="lab-error"><AlertCircle size={14} />{error}</div>}
      {result && (
        <div className="lab-json-grid">
          <pre>{JSON.stringify(result.header, null, 2)}</pre>
          <pre>{JSON.stringify(result.payload, null, 2)}</pre>
        </div>
      )}
    </Panel>
  );
}

function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        const bytes = new TextEncoder().encode(input);
        const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        return { output: btoa(binary), error: "" };
      }
      const binary = atob(input.replace(/\s+/g, ""));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return { output: new TextDecoder("utf-8").decode(bytes), error: "" };
    } catch {
      return { output: "", error: "Invalid Base64 input." };
    }
  }, [input, mode]);

  return (
    <Panel icon={FileText} title="Base64 Encode / Decode" hint="UTF-8 safe for multi-byte text.">
      <div className="lab-toggle">
        <button className={mode === "encode" ? "is-active" : ""} onClick={() => setMode("encode")}>Encode</button>
        <button className={mode === "decode" ? "is-active" : ""} onClick={() => setMode("decode")}>Decode</button>
      </div>
      <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={4} placeholder={mode === "encode" ? "Plain text…" : "Base64 text…"} />
      {error && <div className="lab-error"><AlertCircle size={14} />{error}</div>}
      <pre className="lab-pre">{output || "—"}</pre>
    </Panel>
  );
}

function PasswordTool() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const { score, label } = useMemo(() => {
    if (!password) return { score: 0, label: "—" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length < 8) score = Math.min(score, 1);
    return { score, label: ["Very weak", "Weak", "Fair", "Strong", "Very strong", "Excellent"][score] };
  }, [password]);

  return (
    <Panel icon={Lock} title="Password Strength Estimate" hint="A lightweight local heuristic, not a cracking-time estimate.">
      <div className="lab-password">
        <input type={visible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Type a password to test…" autoComplete="off" />
        <button type="button" onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={15} /> : <Eye size={15} />}</button>
      </div>
      <div className="lab-meter"><span style={{ width: `${(score / 5) * 100}%` }} /></div>
      <div className="lab-score">{label}</div>
    </Panel>
  );
}

type CipherAnalysis = {
  format: string;
  type: string;
  confidence: string;
  detail: string;
  decoded?: string;
  hashAlgorithm?: "SHA-1" | "SHA-256" | "SHA-512";
};

function decodeHex(value: string) {
  const compact = value.replace(/\s+/g, "");
  if (compact.length % 2 || !/^[0-9a-fA-F]+$/.test(compact)) throw new Error("Invalid hexadecimal.");
  const bytes = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) bytes[i / 2] = Number.parseInt(compact.slice(i, i + 2), 16);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function decodeBase64(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function analyzeCipherInput(raw: string): CipherAnalysis {
  const value = raw.trim();
  if (!value) return { format: "—", type: "—", confidence: "—", detail: "Paste something to analyze." };

  const jwtParts = value.split(".");
  if (jwtParts.length === 3) {
    try {
      const header = JSON.parse(base64UrlDecode(jwtParts[0] ?? ""));
      const payload = JSON.parse(base64UrlDecode(jwtParts[1] ?? ""));
      return {
        format: "JWT",
        type: "JSON Web Token",
        confidence: "High",
        detail: "Three segments with valid base64url JSON in the header and payload.",
        decoded: JSON.stringify({ header, payload }, null, 2),
      };
    } catch {}
  }

  const compact = value.replace(/\s+/g, "");
  if (/^[0-9a-fA-F]+$/.test(compact) && compact.length >= 8 && compact.length % 2 === 0) {
    const map: Record<number, string> = { 40: "SHA-1 candidate", 64: "SHA-256 candidate", 128: "SHA-512 candidate" };
    if (map[compact.length]) {
      return {
        format: "Hex digest",
        type: map[compact.length] ?? "Hash candidate",
        confidence: "Candidate",
        detail: "Format and length can suggest a hash family, but cannot prove the algorithm.",
        hashAlgorithm: compact.length === 40 ? "SHA-1" : compact.length === 64 ? "SHA-256" : "SHA-512",
      };
    }
    try {
      return { format: "Hexadecimal", type: "Encoded text", confidence: "Likely", detail: "Valid hexadecimal that decodes cleanly as UTF-8.", decoded: decodeHex(compact) };
    } catch {
      return { format: "Hexadecimal", type: "Binary data", confidence: "Likely", detail: "Valid hexadecimal, but it does not decode as UTF-8 text." };
    }
  }

  if (looksLikeBase64(compact)) {
    try {
      return { format: "Base64", type: "Encoded data", confidence: "High", detail: "Valid Base64 containing readable UTF-8 data.", decoded: decodeBase64(compact) };
    } catch {}
  }

  if (/%[0-9A-Fa-f]{2}/.test(value)) {
    try {
      return { format: "URL encoding", type: "Percent-encoded data", confidence: "Candidate", detail: "Contains percent-encoded bytes.", decoded: decodeURIComponent(value) };
    } catch {}
  }

  return { format: "Unknown", type: "No confident match", confidence: "Low", detail: "CipherScope could not confidently classify the input from structure alone." };
}

function CipherScopeTool() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<CipherAnalysis | null>(null);
  const [candidate, setCandidate] = useState("");
  const [verification, setVerification] = useState("");

  async function verifyCandidate() {
    if (!analysis?.hashAlgorithm || !candidate.trim()) {
      setVerification("Enter a candidate plaintext first.");
      return;
    }
    const actual = await digest(analysis.hashAlgorithm, candidate);
    const expected = input.replace(/\s+/g, "").toLowerCase();
    setVerification(actual === expected ? `Match confirmed — ${analysis.hashAlgorithm} digest matches.` : `No match — candidate does not produce the supplied ${analysis.hashAlgorithm} digest.`);
  }

  return (
    <Panel icon={Search} title="CipherScope" hint="Identify, decode, inspect, and verify structured or encoded values. It does not decrypt one-way hashes.">
      <textarea value={input} onChange={(event) => { setInput(event.target.value); setAnalysis(null); setVerification(""); }} rows={5} placeholder="Paste encoded, hashed, encrypted, or token data…" />
      <div className="lab-actions">
        <button className="lab-primary" onClick={() => setAnalysis(analyzeCipherInput(input))}>Analyze</button>
        <button onClick={() => { setInput(""); setAnalysis(null); setCandidate(""); setVerification(""); }}>Clear</button>
      </div>

      {analysis && (
        <div className="lab-cipher-grid">
          <div className="lab-card">
            <small>Detection</small>
            <div><span>Format</span><b>{analysis.format}</b></div>
            <div><span>Type</span><b>{analysis.type}</b></div>
            <div><span>Confidence</span><b>{analysis.confidence}</b></div>
            <p>{analysis.detail}</p>
          </div>
          <div className="lab-card">
            <small>Analysis</small>
            {analysis.decoded ? <pre className="lab-pre">{analysis.decoded}</pre> : <p>No reversible representation was confidently detected.</p>}
            {analysis.hashAlgorithm && (
              <div className="lab-verify">
                <input value={candidate} onChange={(event) => setCandidate(event.target.value)} placeholder="Candidate plaintext…" />
                <button onClick={() => void verifyCandidate()}>Verify</button>
                {verification && <div className="lab-score"><Check size={13} />{verification}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
