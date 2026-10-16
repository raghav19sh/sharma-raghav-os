"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, FileSearch, GitBranch, LockKeyhole, Play, RotateCcw } from "lucide-react";

type ExperimentId = "pipes" | "processes" | "files";

const experiments: Array<{ id: ExperimentId; title: string; question: string; level: string }> = [
  { id: "pipes", title: "Pipes & redirection", question: "Where do a command's input and output go?", level: "FOUNDATIONS" },
  { id: "processes", title: "Explore processes", question: "How do parent processes, signals, and states relate?", level: "FOUNDATIONS" },
  { id: "files", title: "Inspect a file", question: "What can bytes and a digest tell you about a file?", level: "PRACTICAL" },
];

type Process = { pid: number; ppid: number; name: string; state: "Running" | "Sleeping" | "Zombie" | "Terminated" };
const initialProcesses: Process[] = [
  { pid: 1, ppid: 0, name: "systemd", state: "Running" },
  { pid: 412, ppid: 1, name: "sshd", state: "Sleeping" },
  { pid: 980, ppid: 412, name: "bash", state: "Running" },
  { pid: 1012, ppid: 980, name: "worker", state: "Sleeping" },
];
const fallbackProcess: Process = { pid: 0, ppid: 0, name: "No process selected", state: "Terminated" };

export default function LabPage() {
  const [active, setActive] = useState<ExperimentId>("pipes");
  const [command, setCommand] = useState("printf 'alpha\\nbeta\\n' | grep beta > result.txt");
  const [selectedPid, setSelectedPid] = useState(980);
  const [processes, setProcesses] = useState(initialProcesses);
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ bytes: string; hash: string; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const simulation = useMemo(() => simulatePipeline(command), [command]);
  const selectedProcess = processes.find((process) => process.pid === selectedPid) ?? fallbackProcess;

  async function inspectFile(selected: File | null) {
    setFile(selected);
    setFileInfo(null);
    if (!selected) return;
    if (selected.size > 50 * 1024 * 1024) {
      setFileInfo({ bytes: "", hash: "", error: "Files larger than 50 MiB are not processed. Choose a smaller file." });
      return;
    }
    if (!globalThis.crypto?.subtle) {
      setFileInfo({ bytes: "", hash: "", error: "Web Crypto is unavailable. Open this page in a secure browser context (HTTPS)." });
      return;
    }
    setBusy(true);
    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const preview = Array.from(bytes.slice(0, 32), (byte) => byte.toString(16).padStart(2, "0")).join(" ");
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      setFileInfo({ bytes: preview || "(empty file)", hash });
    } catch {
      setFileInfo({ bytes: "", hash: "", error: "The file could not be read or hashed. Try another file." });
    } finally {
      setBusy(false);
    }
  }

  function signal(signal: "TERM" | "STOP" | "CONT" | "CHLD") {
    setProcesses((current) => current.map((process) => {
      if (process.pid !== selectedPid) return process;
      if (signal === "TERM") return { ...process, state: process.ppid ? "Zombie" : "Terminated" };
      if (signal === "STOP") return { ...process, state: "Sleeping" };
      if (signal === "CONT") return { ...process, state: "Running" };
      return process;
    }));
    if (signal === "CHLD") setProcesses((current) => current.map((process) => process.ppid === selectedPid && process.state === "Zombie" ? { ...process, state: "Terminated" } : process));
  }

  return <main id="main-content" className="lab-site">
    <header className="lab-site-header"><Link href="/" className="lab-back"><ArrowLeft size={14} /> SHARMA-RAGHAV.COM</Link><span>COMPUTING / SYSTEMS / SECURITY</span></header>
    <div className="lab-site-main">
      <p className="lab-eyebrow">AN INTERACTIVE COMPUTING LABORATORY <span>·</span> 001</p>
      <h1>THE <em>LAB</em></h1>
      <p className="lab-lede">Understand systems by experimenting with them.</p>
      <p className="lab-intro">Small, safe experiments for learning how operating systems and files work. Simulations are labelled as such; file inspection runs locally in your browser.</p>
      <nav className="lab-experiment-nav" aria-label="Experiments">
        {experiments.map((experiment, index) => <button key={experiment.id} className={active === experiment.id ? "is-active" : ""} onClick={() => setActive(experiment.id)} aria-pressed={active === experiment.id}>
          <span className="lab-nav-index">0{index + 1}</span><span><strong>{experiment.title}</strong><small>{experiment.level}</small></span><ArrowUpRight size={14} />
        </button>)}
      </nav>

      {active === "pipes" && <section className="lab-experiment">
        <div className="lab-exp-heading"><span className="lab-exp-icon"><GitBranch size={17} /></span><div><p>EXPERIMENT 01 / SIMULATION</p><h2>Pipes &amp; redirection</h2><span>How does a shell connect the output of one process to another?</span></div></div>
        <div className="lab-sim-note">This is a restricted browser simulation. It never runs shell commands or sends data to a server. Supported form: <code>printf 'line\\nline' | grep pattern &gt; filename</code>.</div>
        <label className="lab-field-label" htmlFor="pipe-command">EDIT THE COMMAND</label>
        <div className="lab-command"><span>$</span><input id="pipe-command" value={command} onChange={(event) => setCommand(event.target.value)} spellCheck={false} /><Play size={15} aria-hidden="true" /></div>
        <div className="lab-result-grid"><div className="lab-result"><span>SIMULATED OUTPUT FILE</span><strong>{simulation.file || "No file written"}</strong><pre>{simulation.output || simulation.error || "Output will appear here."}</pre></div><div className="lab-result"><span>STREAM CONNECTIONS</span><p><b>0 · stdin</b> {simulation.stdin}</p><p><b>1 · stdout</b> {simulation.stdout}</p><p><b>2 · stderr</b> {simulation.stderr}</p></div></div>
        <div className="lab-explain"><h3>What the shell arranges</h3><p>A process conventionally starts with file descriptors 0 (standard input), 1 (standard output), and 2 (standard error). A pipe connects the first process’s stdout to the next process’s stdin. The <code>&gt;</code> redirection sends the final command’s stdout to a file, replacing its previous contents.</p><p>In this example, <code>grep</code> reads the lines from the pipe, writes matching lines to <code>result.txt</code>, and leaves stderr attached to the terminal. A shell variable lives in a shell process’s memory; a file is stored in the filesystem and can outlast that shell session.</p><h3>Try it on Linux</h3><pre>printf 'alpha\\nbeta\\n' | grep beta &gt; result.txt<br />cat result.txt</pre><p>Reproduce this command in a disposable directory. Output and shell details can vary by shell and operating system.</p></div>
      </section>}

      {active === "processes" && <section className="lab-experiment">
        <div className="lab-exp-heading"><span className="lab-exp-icon"><GitBranch size={17} /></span><div><p>EXPERIMENT 02 / SIMULATED PROCESS TREE</p><h2>Explore processes</h2><span>Select a process to inspect its parent, children, state, and simulated signals.</span></div></div>
        <div className="lab-sim-note">Illustrative process data only; these PIDs and state changes do not come from the host operating system.</div>
        <div className="lab-process-layout"><div className="lab-process-tree" aria-label="Simulated process tree">{processes.map((process) => <button key={process.pid} style={{ "--depth": process.pid === 1 ? 0 : process.ppid === 1 ? 1 : process.ppid === 412 ? 2 : 3 } as CSSProperties} className={process.pid === selectedPid ? "is-selected" : ""} onClick={() => setSelectedPid(process.pid)}><span>{process.name}</span><small>{process.pid}</small></button>)}</div>
          <div className="lab-process-detail"><span>SELECTED PROCESS</span><h3>{selectedProcess.name} <small>PID {selectedProcess.pid}</small></h3><dl><div><dt>Parent PID</dt><dd>{selectedProcess.ppid || "— (root)"}</dd></div><div><dt>State</dt><dd>{selectedProcess.state}</dd></div><div><dt>Children</dt><dd>{processes.filter((process) => process.ppid === selectedPid).map((process) => process.name).join(", ") || "None"}</dd></div></dl><div className="lab-signal-buttons"><button onClick={() => signal("TERM")}>TERM</button><button onClick={() => signal("STOP")}>STOP</button><button onClick={() => signal("CONT")}>CONT</button><button onClick={() => signal("CHLD")}>WAIT / REAP CHILD</button><button onClick={() => setProcesses(initialProcesses)}><RotateCcw size={13} /> RESET</button></div><p className="lab-caveat">Signals are simplified here. TERM marks a child as an unreaped zombie; select its parent and choose WAIT / REAP CHILD to collect its simulated exit status. Real process state and signal handling depend on timing and program behaviour.</p></div></div>
        <div className="lab-explain"><h3>Observe on your own Linux system</h3><pre>ps -o pid,ppid,stat,comm --forest<br />sleep 30 &amp;<br />jobs -l</pre><p>Run these in a shell to inspect real processes. PIDs, state letters, process trees, and available commands vary by distribution and timing.</p></div>
      </section>}

      {active === "files" && <section className="lab-experiment">
        <div className="lab-exp-heading"><span className="lab-exp-icon"><FileSearch size={17} /></span><div><p>EXPERIMENT 03 / LOCAL FILE INSPECTION</p><h2>Inspect a file</h2><span>Look at the bytes themselves and compute a SHA-256 digest.</span></div></div>
        <div className="lab-sim-note lab-privacy"><LockKeyhole size={14} /> Selected file bytes are read locally by this page and are not uploaded or stored. Files are limited to 50 MiB.</div>
        <label className="lab-file-picker">CHOOSE A FILE<input type="file" onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)} /></label>
        {file && <p className="lab-file-name">{file.name} · {file.size.toLocaleString()} bytes · extension is not a content check</p>}
        {busy && <p className="lab-file-name">Reading and hashing locally…</p>}
        {fileInfo?.error && <p className="lab-error-message" role="alert">{fileInfo.error}</p>}
        {fileInfo && !fileInfo.error && <div className="lab-result-grid"><div className="lab-result"><span>FIRST 32 BYTES · HEX</span><pre>{fileInfo.bytes}</pre><p>Hex shows byte values. Printable ASCII interpretation is intentionally omitted for binary-safe display.</p></div><div className="lab-result"><span>COMPUTED SHA-256</span><pre className="lab-hash">{fileInfo.hash}</pre><p>A matching digest is evidence that byte sequences match. A digest alone does not establish who created a file or whether it is trustworthy.</p></div></div>}
        <div className="lab-explain"><h3>What these observations mean</h3><p>File extensions are names, not proof of format. Programs often identify formats from signatures (magic bytes) near the start of a file. A cryptographic hash summarizes the full byte sequence; changing a byte should change the digest, but a hash is not a signature from a trusted publisher.</p><p>The SHA-256 digest above is computed from the selected file using the browser’s Web Crypto API. The hex preview contains at most the first 32 bytes.</p><h3>Limitations</h3><p>Large files are capped at 50 MiB because the browser reads the selected content into memory for hashing. Browser support and secure-context requirements apply. No MIME type or file-format verdict is inferred.</p></div>
      </section>}

      <section className="lab-notes"><div><p className="lab-eyebrow">FIELD NOTES / IN DEVELOPMENT</p><h2>Questions to investigate</h2><p>These are planned investigations, not reports of experiments performed here. Reproducible procedures and verified observations are still needed before publication.</p></div><ul><li>What happens when a shell executes a pipeline?</li><li>Why can a deleted Linux file still use disk space?</li><li>How does DNS resolution move from application to response?</li><li>How do Unix file permissions affect access?</li><li>What can a SHA-256 hash prove?</li></ul></section>
      <footer className="lab-site-footer"><span>THE LAB · SHARMA-RAGHAV.COM</span><Link href="/">RETURN HOME <ArrowUpRight size={13} /></Link></footer>
    </div>
  </main>;
}

function simulatePipeline(command: string) {
  const match = command.trim().match(/^printf\s+'((?:[^'\\]|\\.)*)'\s*\|\s*grep\s+([^\s>]+)\s*>\s*([a-zA-Z0-9._-]+)\s*$/);
  if (!match) return { file: "", output: "", stdin: "terminal (not modelled)", stdout: "terminal", stderr: "terminal", error: "Unsupported syntax. Use printf 'line\\nline' | grep pattern > filename" };
  const source = match[1] ?? "";
  const pattern = match[2] ?? "";
  const filename = match[3] ?? "result.txt";
  const lines = source.replace(/\\n/g, "\n").replace(/\\t/g, "\t").split("\n");
  const matching = lines.filter((line) => line.includes(pattern));
  return { file: filename, output: matching.join("\n") || "(empty)", stdin: "printf reads its quoted argument", stdout: `printf → pipe → grep → ${filename}`, stderr: "terminal (no simulated errors)" };
}
