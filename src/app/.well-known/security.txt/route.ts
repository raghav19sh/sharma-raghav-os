export function GET() {
  const body = [
    "Contact: mailto:contact@sharma-raghav.com",
    "Policy: https://sharma-raghav.com/docs",
    "Preferred-Languages: en",
    "Canonical: https://sharma-raghav.com/.well-known/security.txt",
  ].join("\n");
  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
