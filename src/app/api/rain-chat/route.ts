import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { message?: string }
    | null;

  const message = body?.message?.trim() ?? "";
  const lower = message.toLowerCase();

  if (!message) {
    return NextResponse.json({ reply: "I'm here. Talk to me." });
  }

  const supabase = await createServerSupabaseClient();

  const [
    { data: profile },
    { data: projects },
    { data: research },
    { data: articles },
    { data: timeline },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name,headline,bio,location,domain,github_url,linkedin_url"
      )
      .limit(1)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("title,summary,status,stack")
      .eq("visibility", "public")
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("research")
      .select("title,summary,kind,status")
      .eq("visibility", "public")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase
      .from("articles")
      .select("title,summary,kind")
      .eq("visibility", "public")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase
      .from("timeline_events")
      .select("year_label,title,body")
      .eq("visibility", "public")
      .order("sort_order", { ascending: true })
      .limit(10),
  ]);

  const name = profile?.display_name ?? "Raghav Sharma";
  const headline =
    profile?.headline ?? "cybersecurity, AI and systems research";
  const bio =
    profile?.bio ?? "A public-facing engineering and research portfolio.";

  const projectNames = (projects ?? []).map((p) => p.title).filter(Boolean);
  const researchNames = (research ?? []).map((r) => r.title).filter(Boolean);
  const articleNames = (articles ?? []).map((a) => a.title).filter(Boolean);

  let reply = "";

  if (includesAny(lower, ["who are you", "what are you", "your name"])) {
    reply =
      "I'm Rain — the quiet companion inside Raghav's terminal. I watch the rain, keep the interface alive, and help visitors explore what he has made.";
  } else if (
    includesAny(lower, [
      "who is raghav",
      "tell me about raghav",
      "about raghav",
      "about me",
      "who am i",
    ])
  ) {
    reply = `${name} is presented here publicly as ${headline}. ${bio}`;
  } else if (
    includesAny(lower, ["project", "projects", "built", "build"])
  ) {
    reply = projectNames.length
      ? `From the public portfolio, I can see ${projectNames
          .slice(0, 5)
          .join(", ")}. ${
          projects?.[0]?.summary ?? "There is more in the Engineering OS."
        }`
      : "The public project list is quiet right now.";
  } else if (
    includesAny(lower, ["research", "paper", "papers", "publication"])
  ) {
    reply = researchNames.length
      ? `The public research shelf includes ${researchNames
          .slice(0, 5)
          .join(", ")}.`
      : "I don't see published research in the public shelf right now.";
  } else if (
    includesAny(lower, ["article", "articles", "knowledge"])
  ) {
    reply = articleNames.length
      ? `The public knowledge shelf includes ${articleNames
          .slice(0, 5)
          .join(", ")}.`
      : "The public knowledge shelf is empty at the moment.";
  } else if (
    includesAny(lower, ["stack", "technology", "technologies", "tools", "tech"])
  ) {
    const stacks = Array.from(
      new Set((projects ?? []).flatMap((p) => p.stack ?? []))
    ).slice(0, 12);

    reply = stacks.length
      ? `Public project stacks include ${stacks.join(", ")}.`
      : "The public project data doesn't expose a stack list yet.";
  } else if (
    includesAny(lower, ["hello", "hi", "hey", "good evening", "good night"])
  ) {
    reply =
      "Hi. 🌧️ I'm glad you stopped by. The city is quiet tonight — what are you curious about?";
  } else if (includesAny(lower, ["joke", "funny", "laugh"])) {
    reply =
      "I tried to debug the rain once. It kept throwing exceptions. So I let it flow. ☔";
  } else if (includesAny(lower, ["dance", "dancing"])) {
    reply =
      "Give me a second. The rain has a rhythm tonight. 💃";
  } else {
    reply = `I know the public side of ${name}, not private things. Ask me about the portfolio, projects, research, engineering, or what you can explore here. I can also scan where rain is falling.`;
  }

  return NextResponse.json({
    reply,
    publicOnly: true,
    context: {
      name,
      headline,
      projects: projectNames,
      research: researchNames,
      articles: articleNames,
      timeline: (timeline ?? []).map(
        (item) => `${item.year_label}: ${item.title}`
      ),
    },
  });
}
