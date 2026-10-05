"use client";

import {
  FilePlus2,
  Image,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Save,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

type Profile = { display_name: string; headline: string | null; bio: string | null; location: string | null; email_public: string | null; linkedin_url: string | null; github_url: string | null };
type RecordItem = { id: string; title: string; slug: string; status: string };
type AdminData = { profile: Profile | null; projects: RecordItem[]; research: RecordItem[]; wallpaperUrl: string };
type Tab = "dashboard" | "wallpaper" | "projects" | "research" | "profile" | "system";

export default function AdminWindow() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadData() {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Admin data unavailable.");
    setData(result);
  }

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        setAuthenticated(Boolean(result.authenticated));
        if (result.authenticated) void loadData().catch((error) => setLoginError(error instanceof Error ? error.message : "Admin data unavailable."));
      })
      .catch(() => setAuthenticated(false));
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed.");
      setAuthenticated(true);
      setPassword("");
      await loadData();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setData(null);
    setTab("dashboard");
    setNotice("");
  }

  async function save(path: string, payload: Record<string, unknown>) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed.");
      setNotice("Saved successfully.");
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (authenticated === null) return <div className="admin-loading">Checking privileged session…</div>;

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="admin-lock"><LockKeyhole size={28} /></div>
        <span className="section-label">PRIVILEGED ACCESS</span>
        <h2>Admin Console</h2>
        <p>This area can modify the public OS. Authentication happens on the server.</p>
        <form onSubmit={login}>
          <label>Password<input autoFocus autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {loginError && <div className="admin-error">{loginError}</div>}
          <button className="admin-primary" type="submit" disabled={busy || !password}><ShieldCheck size={14} />{busy ? "AUTHENTICATING…" : "UNLOCK ADMIN"}</button>
        </form>
        <small>Signed session expires after 8 hours.</small>
      </div>
    );
  }

  if (!data) return <div className="admin-loading">Loading admin data…</div>;

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wallpaper", label: "Wallpaper", icon: Image },
    { id: "projects", label: "Projects", icon: FilePlus2 },
    { id: "research", label: "Research", icon: Wrench },
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "system", label: "System", icon: ShieldCheck },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><ShieldCheck size={18} /><div><strong>ADMIN OS</strong><span>PRIVILEGED MODE</span></div></div>
        <nav>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? "admin-tab is-active" : "admin-tab"} type="button" onClick={() => { setTab(id); setNotice(""); }}><Icon size={14} />{label}</button>
          ))}
        </nav>
        <button className="admin-logout" type="button" onClick={logout}><LogOut size={14} />Lock &amp; sign out</button>
      </aside>

      <section className="admin-main">
        <div className="admin-heading"><div><span className="section-label">CONTROL CENTER</span><h2>{tabs.find((item) => item.id === tab)?.label}</h2></div><span className="admin-secure"><ShieldCheck size={12} /> AUTHENTICATED</span></div>
        {notice && <div className={notice === "Saved successfully." ? "admin-notice" : "admin-error"}>{notice}</div>}
        {tab === "dashboard" && <Dashboard data={data} />}
        {tab === "wallpaper" && <WallpaperEditor value={data.wallpaperUrl} onSave={(url) => save("/api/admin/wallpaper", { url })} busy={busy} />}
        {tab === "projects" && <ProjectEditor projects={data.projects} onSave={(payload) => save("/api/admin/projects", payload)} busy={busy} />}
        {tab === "research" && <ResearchEditor research={data.research} onSave={(payload) => save("/api/admin/research", payload)} busy={busy} />}
        {tab === "profile" && <ProfileEditor profile={data.profile} onSave={(payload) => save("/api/admin/profile", payload)} busy={busy} />}
        {tab === "system" && <SystemPanel onLogout={logout} />}
      </section>
    </div>
  );
}

function Dashboard({ data }: { data: AdminData }) {
  return <div className="admin-grid">
    <Stat label="Public projects" value={data.projects.length} />
    <Stat label="Research records" value={data.research.length} />
    <Stat label="Wallpaper" value={data.wallpaperUrl.startsWith("http") ? "REMOTE" : "LOCAL"} />
    <div className="admin-card admin-span-2"><span className="section-label">ADMIN SCOPE</span><p>Publish projects and research, change the OS wallpaper, update the public profile, or lock the admin session.</p></div>
    <div className="admin-card"><span className="section-label">WRITE PATH</span><p>Privileged mutations happen server-side with the Supabase service role. The browser never receives that secret.</p></div>
  </div>;
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="admin-card"><span className="section-label">{label}</span><strong className="admin-stat">{value}</strong></div>; }

function WallpaperEditor({ value, onSave, busy }: { value: string; onSave: (value: string) => void; busy: boolean }) {
  const [url, setUrl] = useState(value);
  return <div className="admin-card">
    <span className="section-label">OS WALLPAPER</span>
    <h3>Change the public desktop wallpaper</h3>
    <label>Image URL<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/wallpaper.svg or https://…" /></label>
    <p className="admin-help">Use a deployed local asset or a stable HTTPS image. This value is stored server-side and used by every visitor.</p>
    <div className="admin-wallpaper-preview" style={{ backgroundImage: "url(" + (url || "/wallpaper.svg") + ")" }} />
    <button className="admin-primary" type="button" disabled={busy || !url.trim()} onClick={() => onSave(url.trim())}><Save size={14} />{busy ? "SAVING…" : "SAVE WALLPAPER"}</button>
  </div>;
}

function ProjectEditor({ projects, onSave, busy }: { projects: RecordItem[]; onSave: (payload: Record<string, unknown>) => void; busy: boolean }) {
  const empty = { title: "", slug: "", kind: "project", summary: "", body: "", repo_url: "", live_url: "", stack: "", status: "active", started_at: "" };
  const [form, setForm] = useState(empty);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave({ ...form, stack: form.stack.split(",").map((item) => item.trim()).filter(Boolean) }); setForm(empty); };
  return <><form className="admin-card admin-form-grid" onSubmit={submit}>
    <div className="admin-span-2"><span className="section-label">NEW PROJECT</span><h3>Add a public project entry</h3></div>
    <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required /><Field label="Slug (optional)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
    <Field label="Kind" value={form.kind} onChange={(v) => setForm({ ...form, kind: v })} /><Field label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
    <Field label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} wide />
    <label className="admin-span-2">Body<textarea rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Project details…" /></label>
    <Field label="GitHub URL" value={form.repo_url} onChange={(v) => setForm({ ...form, repo_url: v })} /><Field label="Live URL" value={form.live_url} onChange={(v) => setForm({ ...form, live_url: v })} />
    <Field label="Stack (comma separated)" value={form.stack} onChange={(v) => setForm({ ...form, stack: v })} wide /><Field label="Started at" value={form.started_at} onChange={(v) => setForm({ ...form, started_at: v })} placeholder="2026-10-05" />
    <div className="admin-span-2"><button className="admin-primary" type="submit" disabled={busy || !form.title.trim()}><FilePlus2 size={14} />{busy ? "SAVING…" : "PUBLISH PROJECT"}</button></div>
  </form><RecordList title="Existing projects" records={projects} /></>;
}

function ResearchEditor({ research, onSave, busy }: { research: RecordItem[]; onSave: (payload: Record<string, unknown>) => void; busy: boolean }) {
  const empty = { title: "", slug: "", kind: "article", summary: "", body: "", status: "published", read_time_minutes: "5", published_at: "" };
  const [form, setForm] = useState(empty);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave({ ...form, read_time_minutes: Number(form.read_time_minutes || 5) }); setForm(empty); };
  return <><form className="admin-card admin-form-grid" onSubmit={submit}>
    <div className="admin-span-2"><span className="section-label">NEW RESEARCH</span><h3>Add a public research entry</h3></div>
    <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required /><Field label="Slug (optional)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
    <Field label="Kind" value={form.kind} onChange={(v) => setForm({ ...form, kind: v })} /><Field label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
    <Field label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} wide />
    <label className="admin-span-2">Body<textarea rows={8} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Research write-up…" /></label>
    <Field label="Read time (minutes)" value={form.read_time_minutes} onChange={(v) => setForm({ ...form, read_time_minutes: v })} /><Field label="Published at" value={form.published_at} onChange={(v) => setForm({ ...form, published_at: v })} placeholder="2026-10-05" />
    <div className="admin-span-2"><button className="admin-primary" type="submit" disabled={busy || !form.title.trim()}><FilePlus2 size={14} />{busy ? "SAVING…" : "PUBLISH RESEARCH"}</button></div>
  </form><RecordList title="Existing research" records={research} /></>;
}

function ProfileEditor({ profile, onSave, busy }: { profile: Profile | null; onSave: (payload: Record<string, unknown>) => void; busy: boolean }) {
  const [form, setForm] = useState({ display_name: profile?.display_name || "Raghav Sharma", headline: profile?.headline || "", bio: profile?.bio || "", location: profile?.location || "", email_public: profile?.email_public || "", linkedin_url: profile?.linkedin_url || "", github_url: profile?.github_url || "" });
  return <form className="admin-card admin-form-grid" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
    <div className="admin-span-2"><span className="section-label">PUBLIC IDENTITY</span><h3>Update profile information</h3></div>
    <Field label="Display name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} required /><Field label="Headline" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />
    <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} /><Field label="Public email" value={form.email_public} onChange={(v) => setForm({ ...form, email_public: v })} />
    <Field label="GitHub URL" value={form.github_url} onChange={(v) => setForm({ ...form, github_url: v })} /><Field label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} />
    <label className="admin-span-2">Bio<textarea rows={6} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
    <div className="admin-span-2"><button className="admin-primary" type="submit" disabled={busy || !form.display_name.trim()}><Save size={14} />{busy ? "SAVING…" : "SAVE PROFILE"}</button></div>
  </form>;
}

function SystemPanel({ onLogout }: { onLogout: () => void }) {
  return <div className="admin-grid">
    <div className="admin-card admin-span-2"><span className="section-label">SESSION</span><h3>Privileged session controls</h3><p>The admin cookie is HTTP-only, signed on the server, and expires after 8 hours.</p><button className="admin-danger" type="button" onClick={onLogout}><LogOut size={14} />LOCK ADMIN SESSION</button></div>
    <div className="admin-card"><span className="section-label">VISITOR MODE</span><p>Public visitors remain read-only. Admin API routes reject unauthenticated mutations.</p></div>
    <div className="admin-card"><span className="section-label">BACKEND</span><p>Supabase service credentials are server-only environment variables.</p></div>
  </div>;
}

function RecordList({ title, records }: { title: string; records: RecordItem[] }) {
  return <div className="admin-card"><span className="section-label">{title}</span><div className="admin-records">{records.map((record) => <div key={record.id}><strong>{record.title}</strong><small>{record.slug} · {record.status}</small></div>)}</div></div>;
}

function Field({ label, value, onChange, required, wide, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; wide?: boolean; placeholder?: string }) {
  return <label className={wide ? "admin-span-2" : ""}>{label}<input value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} /></label>;
}