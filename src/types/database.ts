// Types matching supabase/migrations/0001_init.sql.
// If you have the Supabase CLI, prefer generating this file for real via:
//   supabase gen types typescript --local > src/types/database.ts
// This hand-written version exists so the rest of the scaffold type-checks
// before that step happens.

export type Visibility = "public" | "unlisted" | "private";

export type ResearchStatus = "draft" | "researching" | "review" | "published" | "archived";
export type ProjectStatus = "idea" | "active" | "paused" | "completed" | "archived";
export type ArticleStatus = "draft" | "published" | "archived";
export type BookStatus = "queue" | "reading" | "completed" | "abandoned";
export type CourseStatus = "planned" | "in_progress" | "completed";
export type OpenLoopType = "task" | "goal" | "research" | "project" | "certification" | "other";
export type OpenLoopPriority = "low" | "normal" | "high";
export type OpenLoopStatus = "open" | "in_progress" | "blocked" | "done";
export type MediaKind = "image" | "document" | "video";

export interface Profile {
  id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email_public: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  domain: string | null;
  updated_at: string;
}

export interface Research {
  id: string;
  slug: string;
  title: string;
  kind: "Paper" | "Whitepaper" | "Research Note" | "Draft";
  summary: string | null;
  body: string | null;
  read_time_minutes: number | null;
  status: ResearchStatus;
  visibility: Visibility;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  kind: string | null;
  summary: string | null;
  body: string | null;
  repo_url: string | null;
  live_url: string | null;
  stack: string[];
  status: ProjectStatus;
  visibility: Visibility;
  started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  kind: string | null;
  summary: string | null;
  body: string | null;
  read_time_minutes: number | null;
  status: ArticleStatus;
  visibility: Visibility;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  status: ArticleStatus;
  visibility: Visibility;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  category: string | null;
  status: BookStatus;
  progress_percent: number;
  rating: number | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string | null;
  status: CourseStatus;
  progress_percent: number;
  is_certification: boolean;
  credential_url: string | null;
  completed_at: string | null;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

export interface Snippet {
  id: string;
  title: string;
  language: string | null;
  summary: string | null;
  code: string | null;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  kind: MediaKind | null;
  storage_path: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  alt_text: string | null;
  visibility: Visibility;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  year_label: string;
  title: string;
  body: string | null;
  event_date: string | null;
  is_current: boolean;
  sort_order: number;
  visibility: Visibility;
  created_at: string;
}

export interface OpenLoop {
  id: string;
  title: string;
  description: string | null;
  type: OpenLoopType;
  priority: OpenLoopPriority;
  status: OpenLoopStatus;
  due_date: string | null;
  related_table: string | null;
  related_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ActivityEvent {
  id: string;
  kind: string;
  summary: string;
  related_table: string | null;
  related_id: string | null;
  occurred_at: string;
}

export interface AuditLog {
  id: string;
  actor: string | null;
  action: string;
  resource_table: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
}

/** The tables that share the id/slug/title/summary/status/visibility shape
 *  and can go through the generic content query functions in lib/data/content.ts. */
export type SlugContentTable = "research" | "projects" | "articles" | "journal_entries";
export type SlugContentRow = Research | Project | Article | JournalEntry;

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
}
