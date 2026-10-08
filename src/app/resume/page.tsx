import Link from "next/link";

export default function ResumePage() {
  return (
    <main className="resume-page">
      <div className="resume-shell">
        <Link className="resume-back" href="/">← BACK</Link>
        <header className="resume-header">
          <div>
            <span className="resume-kicker">CYBERSECURITY · VAPT · DFIR</span>
            <h1>Raghav Sharma</h1>
            <p>Cybersecurity · VAPT · Malware Analysis & Engineering · Digital Forensics</p>
          </div>
          <div className="resume-contact">
            <span>contact@sharma-raghav.com</span>
            <span>+91 86055 32112</span>
            <span>sharma-raghav.com</span>
            <span>github.com/raghav19sh</span>
          </div>
        </header>

        <section className="resume-section">
          <span className="resume-label">PROFILE</span>
          <p>Cybersecurity & Forensics engineer focused on VAPT, web/application security, malware analysis and engineering, threat detection, and digital forensics. Hands-on with offensive security, Linux, Python, network analysis, security tooling, and practical research.</p>
        </section>

        <section className="resume-grid">
          <div className="resume-section">
            <span className="resume-label">OFFENSIVE SECURITY</span>
            <p>VAPT · Penetration Testing · OWASP Top 10 · Web Security · Reconnaissance · Vulnerability Validation · Burp Suite · Nmap · Metasploit</p>
          </div>
          <div className="resume-section">
            <span className="resume-label">MALWARE & REVERSE ENGINEERING</span>
            <p>Static / Dynamic / Behavioral Analysis · IOC · Threat Intelligence · Ghidra · x64dbg</p>
          </div>
          <div className="resume-section">
            <span className="resume-label">DFIR & DETECTION</span>
            <p>SIEM · Log Analysis · Threat Hunting · Alert Triage · MITRE ATT&CK · Incident Response · Digital Forensics</p>
          </div>
          <div className="resume-section">
            <span className="resume-label">ENGINEERING</span>
            <p>Python · Bash · TypeScript / JavaScript · React / Next.js · PostgreSQL / Supabase · REST APIs · Git / GitHub · Docker</p>
          </div>
        </section>

        <section className="resume-section">
          <span className="resume-label">SELECTED PROJECTS</span>
          <div className="resume-projects">
            <article><strong>Sharma-Raghav OS</strong><span>Cybersecurity portfolio workstation</span></article>
            <article><strong>DigiTrust</strong><span>Digital trust analysis platform</span></article>
            <article><strong>ThreatShield</strong><span>QR phishing / QRishing protection</span></article>
            <article><strong>SOC Detection Lab</strong><span>Detection engineering and threat hunting</span></article>
            <article><strong>Cybersecurity Tools Platform</strong><span>Browser-based security and utility tooling</span></article>
          </div>
        </section>

        <section className="resume-grid">
          <div className="resume-section">
            <span className="resume-label">EXPERIENCE</span>
            <h2>Business Analyst Virtual Intern</h2>
            <p>AICTE-EduSkills / Celonis-supported virtual internship · Completed with Grade O</p>
          </div>
          <div className="resume-section">
            <span className="resume-label">EDUCATION</span>
            <h2>B.Tech — CSE (Cybersecurity & Forensics)</h2>
            <p>MIT ADT University, Pune</p>
          </div>
        </section>
      </div>
    </main>
  );
}
