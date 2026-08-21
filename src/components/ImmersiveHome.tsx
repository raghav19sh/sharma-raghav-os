import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { HeroThemeVisual } from "@/components/globe/HeroThemeVisual";
import { formatDate } from "@/lib/utils/format";
import type { MediaAsset, Profile, Project, Research, TimelineEvent } from "@/types/database";
import type { StatusSnapshot } from "@/lib/data/status";

interface ImmersiveHomeProps {
  profile: Profile | null;
  projects: Project[];
  research: Research[];
  timeline: TimelineEvent[];
  status: StatusSnapshot;
  media: MediaAsset[];
  publicTheme: string;
}

export function ImmersiveHome({
  profile,
  projects,
  research,
  timeline,
  status,
  media,
  publicTheme,
}: ImmersiveHomeProps) {
  const displayName = profile?.display_name?.trim() || "Raghav Sharma";
  const [firstName, ...rest] = displayName.split(/\s+/);
  const lastName = rest.join(" ") || "Sharma";
  const heroMedia = media.find((item) => item.kind === "image");
  const heroTitle = profile?.headline?.trim() || "Information security, research & systems.";
  const heroBio = profile?.bio?.trim() || "Investigating how systems behave, where they fail, and how they can be made stronger.";

  return (
    <div className="immersive-home">
      <section className="immersive-hero" aria-labelledby="hero-title">
        <aside className="immersive-rail">
          <div className="immersive-rail__top">
            <span className="immersive-eyebrow">01 / Identity</span>
            <span className="immersive-rail__line" />
          </div>
          <div className="immersive-rail__meta">
            <span>INFORMATION SECURITY</span>
            <span>RESEARCH / ENGINEERING</span>
            <span>{profile?.domain || "SHARMA-RAGHAV.COM"}</span>
          </div>
          <div className="immersive-rail__status">
            <span className={`immersive-status-dot ${status.database === "ok" ? "is-live" : "is-error"}`} />
            <div>
              <strong>{status.database === "ok" ? "SYSTEM ONLINE" : "SYSTEM CHECK"}</strong>
              <small>Database {status.database === "ok" ? "connected" : "unavailable"}</small>
            </div>
          </div>
        </aside>

        <div className="immersive-hero__copy">
          <div className="immersive-kicker"><span /> {heroTitle}</div>
          <h1 id="hero-title">
            {firstName}
            <br />
            {lastName}<b>.</b>
          </h1>
          <p>{heroBio}</p>
          <div className="immersive-tags">
            <span>VAPT</span><i>/</i><span>RED TEAM</span><i>/</i><span>FORENSICS</span><i>/</i><span>RESEARCH</span>
          </div>
          <Link href="#work" className="immersive-scroll">
            <span className="immersive-scroll__icon"><ArrowDownRight size={15} strokeWidth={1.3} /></span>
            Scroll to explore
          </Link>
        </div>

        <div className="immersive-hero__visual">
          {heroMedia ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroMedia.storage_path} alt={heroMedia.alt_text ?? heroMedia.title} />
          ) : (
            <HeroThemeVisual theme={publicTheme as never} />
          )}
          <div className="immersive-visual-overlay" />
          <div className="immersive-visual-caption">
            <span>PUBLIC ARCHIVE</span>
            <span>{profile?.location || "ONLINE"}</span>
          </div>
        </div>
      </section>

      <section id="work" className="immersive-section immersive-projects" aria-labelledby="work-title">
        <SectionHeader number="02" title="Selected work" href="/engineering" action="View all work" />
        {projects.length === 0 ? (
          <EmptyEditorial text="No public projects are currently published." />
        ) : (
          <div className="immersive-project-grid">
            {projects.slice(0, 3).map((project, index) => (
              <Link key={project.id} href={`/engineering/${project.slug}`} className={`immersive-project immersive-project--${index + 1}`}>
                <div className="immersive-project__visual" aria-hidden="true">
                  <div className="project-art" />
                  <span className="project-index">0{index + 1}</span>
                </div>
                <div className="immersive-project__body">
                  <div>
                    <span className="immersive-project__kind">{project.kind || "Project"}</span>
                    <h3>{project.title}</h3>
                    <p>{project.summary || project.body?.slice(0, 120) || "Public project archive."}</p>
                  </div>
                  <ArrowRight size={18} strokeWidth={1.3} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="immersive-section immersive-research" aria-labelledby="research-title">
        <SectionHeader number="03" title="Latest research" href="/research" action="View all research" />
        {research.length === 0 ? (
          <EmptyEditorial text="No public research is currently published." />
        ) : (
          <div className="immersive-research-list">
            {research.slice(0, 5).map((item) => (
              <Link key={item.id} href={`/research/${item.slug}`} className="immersive-research-row">
                <div>
                  <span>{item.kind}</span>
                  <h3>{item.title}</h3>
                </div>
                <time>{formatDate(item.published_at ?? item.created_at)}</time>
                <ArrowRight size={17} strokeWidth={1.3} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="immersive-section immersive-timeline" aria-labelledby="timeline-title">
        <SectionHeader number="04" title="Journey" href="/timeline" action="View full timeline" />
        {timeline.length === 0 ? (
          <EmptyEditorial text="No public timeline events are currently published." />
        ) : (
          <ol className="immersive-timeline-list">
            {timeline.slice(-5).map((item) => (
              <li key={item.id} className={item.is_current ? "is-current" : ""}>
                <div className="immersive-timeline-dot" />
                <span>{item.year_label}</span>
                <h3>{item.title}</h3>
                {item.body && <p>{item.body}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="immersive-contact">
        <div className="immersive-contact__number">05 / Contact</div>
        <h2>Have something<br />worth investigating<span>?</span></h2>
        <div className="immersive-contact__bottom">
          <div>
            {profile?.email_public ? <a href={`mailto:${profile.email_public}`}>{profile.email_public}</a> : <Link href="/about">Open profile</Link>}
            <div className="immersive-socials">
              {profile?.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer">GitHub <ExternalLink size={11} /></a>}
              {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={11} /></a>}
            </div>
          </div>
          <Link href="/about" className="immersive-contact__arrow"><ArrowUpRight /></Link>
        </div>
      </section>

      <footer className="immersive-footer">
        <span>© {new Date().getFullYear()} {displayName}</span>
        <span>BUILDING SECURE SYSTEMS / BREAKING INSECURE ONES.</span>
        <span>{status.contentCounts.projects} PROJECTS · {status.contentCounts.research} RESEARCH</span>
      </footer>
    </div>
  );
}

function SectionHeader({ number, title, href, action }: { number: string; title: string; href: string; action: string }) {
  return (
    <div className="immersive-section__header">
      <div><span>{number}</span><h2>{title}</h2></div>
      <Link href={href}>{action}<ArrowRight size={14} strokeWidth={1.2} /></Link>
    </div>
  );
}

function EmptyEditorial({ text }: { text: string }) {
  return <div className="immersive-empty">{text}</div>;
}
