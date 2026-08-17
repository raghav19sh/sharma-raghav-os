/**
 * §29 of the brief explicitly rejects bare percentages like "91%
 * cybersecurity" without a real methodology behind the number. This is the
 * evidence-based alternative: each skill area points at the real projects,
 * certifications, or experience that back it up. Sourced directly from the
 * resume — nothing here is invented.
 */
export interface SkillArea {
  name: string;
  tools: string[];
  evidence: string[];
}

export const SKILL_AREAS: SkillArea[] = [
  {
    name: "Cybersecurity",
    tools: ["Malware Analysis", "Static & Dynamic Analysis", "Threat Intelligence", "Incident Response", "Vulnerability Assessment", "OWASP Top 10", "Digital Forensics"],
    evidence: ["Malware Analysis & Clipper Research Project", "Digital Forensics certification"],
  },
  {
    name: "Security Operations (SOC)",
    tools: ["SIEM (Splunk/ELK fundamentals)", "Log Analysis", "Threat Hunting", "Alert Triage", "MITRE ATT&CK Framework"],
    evidence: ["Coursework and self-study — no professional SOC role yet"],
  },
  {
    name: "Networking & Systems",
    tools: ["TCP/IP", "DNS", "DHCP", "VPNs", "Subnetting", "Firewalls", "Wireshark", "Linux Security Hardening"],
    evidence: ["QR Phishing Simulation project", "Malware Analysis & Clipper Research Project"],
  },
  {
    name: "Cloud Security",
    tools: ["AWS IAM", "Azure Security Fundamentals", "GCP Security Basics", "Cloud Workload Protection"],
    evidence: ["Cloud Foundations (AWS) certification"],
  },
  {
    name: "Tools & Scripting",
    tools: ["Python", "Bash", "Nmap", "Metasploit", "Burp Suite", "Ghidra", "x64dbg", "Flask", "Ngrok"],
    evidence: ["QR Phishing Simulation (Python/Flask)", "Malware Analysis & Clipper Research (Python/C++/Ghidra/x64dbg)"],
  },
];
