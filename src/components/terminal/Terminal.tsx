"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  RainCompanion,
  type CompanionMood,
} from "./RainCompanion";
import { RainEnvironment } from "./RainEnvironment";
import { getRainMood } from "./RainBehavior";

interface TermLine {
  type: "in" | "out";
  text: string;
}

interface WeatherItem {
  city: string;
  country: string;
  rain: number;
  showers: number;
  precipitation: number;
  temperature: number;
  heavy: boolean;
}

async function runLayer2(
  lower: string,
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  if (
    lower.includes("unfinished") &&
    lower.includes("project")
  ) {
    const { data, error } = await supabase
      .from("projects")
      .select("title,status")
      .eq("visibility", "public")
      .in("status", ["idea", "active", "paused"]);

    if (error) {
      return `Query failed: ${error.message}`;
    }

    if (!data?.length) {
      return "No unfinished public projects right now.";
    }

    return data
      .map((p) => `${p.title} (${p.status})`)
      .join(", ");
  }

  if (
    lower.includes("research") &&
    (lower.includes("this month") ||
      lower.includes("recent"))
  ) {
    const monthAgo = new Date(
      Date.now() - 30 * 86400000
    ).toISOString();

    const { data, error } = await supabase
      .from("research")
      .select("title")
      .eq("visibility", "public")
      .eq("status", "published")
      .gte("published_at", monthAgo);

    if (error) {
      return `Query failed: ${error.message}`;
    }

    if (!data?.length) {
      return "No research published in the last 30 days.";
    }

    return data.map((r) => r.title).join(", ");
  }

  if (
    lower === "projects" ||
    lower === "project" ||
    lower.includes("show projects") ||
    lower.includes("list projects")
  ) {
    const { data, error } = await supabase
      .from("projects")
      .select("title,status")
      .eq("visibility", "public")
      .order("updated_at", { ascending: false })
      .limit(8);

    if (error) {
      return "I couldn't read the public project shelf right now.";
    }

    if (!data?.length) {
      return "The public project shelf is empty right now.";
    }

    return data
      .map((project) => `${project.title} (${project.status})`)
      .join(", ");
  }

  if (
    lower === "research" ||
    lower === "papers" ||
    lower === "publications"
  ) {
    const { data, error } = await supabase
      .from("research")
      .select("title,status")
      .eq("visibility", "public")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8);

    if (error) {
      return "I couldn't read the public research shelf right now.";
    }

    if (!data?.length) {
      return "The public research shelf is empty right now.";
    }

    return data
      .map((item) => item.title)
      .join(", ");
  }

  return null;
}

/*
 * ------------------------------------------------
 * COMMAND → CHARACTER ACTION
 * ------------------------------------------------
 */

function commandMood(
  lower: string
): CompanionMood | null {
  if (lower === "dance") {
    return "dance";
  }

  if (
    lower === "laugh" ||
    lower === "joke"
  ) {
    return "laugh";
  }

  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "wave" ||
    lower.includes("greet")
  ) {
    return "wave";
  }

  if (
    lower === "walk" ||
    lower === "walk around"
  ) {
    return "walk";
  }

  if (
    lower === "roam" ||
    lower.includes("roam around")
  ) {
    return "roam";
  }
  if (
  lower === "listen" ||
  lower === "hear"
) {
  return "listen";
}

  if (
    lower === "think" ||
    lower === "ponder"
  ) {
    return "think";
  }

  return null;
}

/*
 * ------------------------------------------------
 * RAIN VOICE
 * ------------------------------------------------
 */

function speakRain(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    utterance.lang = "en-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    utterance.volume = 0.82;

    const voices =
      window.speechSynthesis.getVoices();

    const preferred =
      voices.find(
        (voice) =>
          /female|woman|samantha|karen|moira|zira|ava|serena|susan/i.test(
            voice.name
          )
      ) ??
      voices.find(
        (voice) =>
          /en[-_](IN|GB|AU|US)/i.test(
            voice.lang
          )
      ) ??
      voices.find((voice) =>
        /^en/i.test(voice.lang)
      );

    if (preferred) {
      utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}

/*
 * ------------------------------------------------
 * TERMINAL
 * ------------------------------------------------
 */

export function Terminal({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [lines, setLines] = useState<TermLine[]>([
    {
      type: "out",
      text: "Initializing Rain Terminal…",
    },
    {
      type: "out",
      text: "Atmosphere core online.",
    },
    {
      type: "out",
      text: "Syncing with live rain feed…",
    },
    {
      type: "out",
      text: "Connecting to public Raghav profile…",
    },
    {
      type: "out",
      text: "Connection established.",
    },
    {
      type: "out",
      text: "Rain: Hey there, Raghav. 👋",
    },
    {
      type: "out",
      text: "I'm here. Ask me something, or tell me to dance.",
    },
  ]);

  const [input, setInput] = useState("");
  const [mood, setMood] =
    useState<CompanionMood>("idle");

  const [weather, setWeather] = useState<
    WeatherItem[]
  >([]);

  const bodyRef =
    useRef<HTMLDivElement>(null);

  const supabase = createClient();

  /*
   * Keep terminal scrolled to latest output.
   */
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop =
        bodyRef.current.scrollHeight;
    }
  }, [lines]);

  /*
   * Stop Rain's voice when leaving the terminal.
   */
  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * ------------------------------------------------
   * LIVE WEATHER
   * ------------------------------------------------
   */

  async function scanRain() {
    try {
      const res = await fetch(
        "/api/rain-scan",
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "weather unavailable"
        );
      }

      const json = await res.json();

      const heavy =
        (json.heavy ?? []) as WeatherItem[];

      const raining =
        (json.raining ?? []) as WeatherItem[];

      setWeather(
        heavy.length ? heavy : raining
      );

      if (heavy.length) {
        const top = heavy[0]!;

        return `It's raining beautifully in ${top.city}, ${top.country} right now — about ${top.precipitation.toFixed(
          1
        )} mm/h.`;
      }

      if (raining.length) {
        const top = raining[0]!;

        return `${top.city}, ${top.country} is getting rain right now — about ${top.precipitation.toFixed(
          1
        )} mm/h.`;
      }

      return "The cities I scanned are mostly dry right now. The sky is taking a break.";
    } catch {
      return "I couldn't reach the live weather feed right now.";
    }
  }

  /*
   * ------------------------------------------------
   * AI CHAT
   * ------------------------------------------------
   */

  async function chatWithRain(
    message: string
  ) {
    const res = await fetch(
      "/api/rain-chat",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "chat unavailable"
      );
    }

    const json = await res.json();

    return String(
      json.reply ??
        "I'm here. Talk to me."
    );
  }

  /*
   * ------------------------------------------------
   * RESPONSE HANDLER
   * ------------------------------------------------
   *
   * The important change:
   *
   * activity happens first.
   *
   * When speech actually begins:
   *     → talk
   *
   * When speech ends:
   *     → idle
   */

  function appendConversation(
    cmd: string,
    response: string,
    activity: CompanionMood = "talk"
  ) {
    setLines((previous) => [
      ...previous,
      {
        type: "in",
        text: cmd,
      },
      {
        type: "out",
        text: response,
      },
    ]);

    setMood(activity);

    speakRain(
      response,
      () => {
        setMood(
          getRainMood("speaking")
        );
      },
      () => {
        setMood(
          getRainMood("finished")
        );
      }
    );
  }

  /*
   * ------------------------------------------------
   * SUBMIT
   * ------------------------------------------------
   */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const cmd = input.trim();

    if (!cmd) return;

    const lower =
      cmd.toLowerCase();

    /*
     * Submission means Rain THINKS.
     *
     * This is intentionally different from typing.
     */
    setMood(
      getRainMood("submitted")
    );

    /*
     * ------------------------------------------------
     * CLEAR
     * ------------------------------------------------
     */

    if (lower === "clear") {
      setLines([]);
      setInput("");
      setMood(
        getRainMood("reset")
      );
      return;
    }

    /*
     * ------------------------------------------------
     * HELP
     * ------------------------------------------------
     */

    if (lower === "help") {
      const response =
        "Try: hi, wave, dance, think, walk, roam, laugh, weather, rain, projects, research, status — or ask me anything about Raghav's public work.";

      appendConversation(
        cmd,
        response
      );

      setInput("");
      return;
    }

    /*
     * ------------------------------------------------
     * PUBLIC IDENTITY / MODULE COMMANDS
     * ------------------------------------------------
     */

    if (
      lower === "whoami" ||
      lower === "who am i" ||
      lower === "about"
    ) {
      const response =
        "You are at Sharma-Raghav OS — a public interface for Raghav's cybersecurity, engineering, research, and security work.";

      appendConversation(cmd, response);
      setInput("");
      return;
    }

    if (lower === "soc") {
      const response =
        "The SOC surface is not connected to a live SOC feed yet. I won't invent alerts or agent counts.";

      appendConversation(cmd, response);
      setInput("");
      return;
    }

    /*
     * ------------------------------------------------
     * CHARACTER COMMANDS
     * ------------------------------------------------
     */

    const action =
      commandMood(lower);

    if (action) {
      let response =
        "Okay.";

      if (action === "dance") {
        response =
          "Okay. One song, one storm, one little dance. 💃";
      }

      else if (
        action === "laugh"
      ) {
        response =
          "I tried to debug the rain once. It kept throwing exceptions. So I let it flow. ☔";
      }

      else if (
        action === "wave"
      ) {
        response =
          "Hi, Raghav. I see you. 👋";
      }

      else if (
        action === "think"
      ) {
        response =
          "Give me a moment. I'm thinking.";
      }

      else if (
        action === "walk" ||
        action === "roam"
      ) {
        response =
          "I'm going for a little walk through the rain.";
      }

      /*
       * Set the requested character action.
       */
      setMood(action);

      /*
       * Speak the response.
       */
      speakRain(
        response,
        () => {
          setMood(
            getRainMood("speaking")
          );
        },
        () => {
          setMood(
            getRainMood("finished")
          );
        }
      );

      setLines((previous) => [
        ...previous,
        {
          type: "in",
          text: cmd,
        },
        {
          type: "out",
          text: response,
        },
      ]);

      setInput("");

      /*
       * Don't immediately destroy the action.
       *
       * The speech lifecycle will return Rain
       * to idle after speaking.
       */
      return;
    }

    /*
     * ------------------------------------------------
     * WEATHER
     * ------------------------------------------------
     */

    if (
      lower === "weather" ||
      lower === "rain" ||
      lower.includes(
        "where is it raining"
      ) ||
      lower.includes(
        "where is raining"
      ) ||
      lower.includes("heavy rain")
    ) {
      setLines((previous) => [
        ...previous,
        {
          type: "in",
          text: cmd,
        },
        {
          type: "out",
          text: "Scanning live rain conditions across selected cities…",
        },
      ]);

      setMood(
        getRainMood("think")
      );

      const response =
        await scanRain();

      setLines((previous) => [
        ...previous,
        {
          type: "out",
          text: response,
        },
      ]);

      speakRain(
        response,
        () => {
          setMood(
            getRainMood("speaking")
          );
        },
        () => {
          setMood(
            getRainMood("finished")
          );
        }
      );

      setInput("");
      return;
    }

    /*
     * ------------------------------------------------
     * STATUS
     * ------------------------------------------------
     */

    if (lower === "status") {
      setLines((previous) => [
        ...previous,
        {
          type: "in",
          text: cmd,
        },
        {
          type: "out",
          text: "Fetching system status…",
        },
      ]);

      try {
        const res = await fetch(
          "/api/v1/status"
        );

        const json =
          await res.json();

        const response =
          `Database: ${json.data.database} · research: ${json.data.contentCounts.research} · projects: ${json.data.contentCounts.projects}`;

        setLines((previous) => [
          ...previous,
          {
            type: "out",
            text: response,
          },
        ]);

        speakRain(
          response,
          () => {
            setMood(
              getRainMood(
                "speaking"
              )
            );
          },
          () => {
            setMood(
              getRainMood(
                "finished"
              )
            );
          }
        );
      } catch {
        const response =
          "I couldn't reach the system status endpoint.";

        setLines((previous) => [
          ...previous,
          {
            type: "out",
            text: response,
          },
        ]);

        speakRain(
          response,
          () => {
            setMood(
              getRainMood(
                "speaking"
              )
            );
          },
          () => {
            setMood(
              getRainMood(
                "finished"
              )
            );
          }
        );
      }

      setInput("");
      return;
    }

    /*
     * ------------------------------------------------
     * GENERAL AI REQUEST
     * ------------------------------------------------
     */

    setLines((previous) => [
      ...previous,
      {
        type: "in",
        text: cmd,
      },
      {
        type: "out",
        text: "Rain is thinking…",
      },
    ]);

    setMood(
      getRainMood("think")
    );

    try {
      const layer2 =
        await runLayer2(
          lower,
          supabase
        );

      const response =
        layer2 ??
        (await chatWithRain(cmd));

      setLines((previous) => [
        ...previous,
        {
          type: "out",
          text: response,
        },
      ]);

      speakRain(
        response,
        () => {
          setMood(
            getRainMood("speaking")
          );
        },
        () => {
          setMood(
            getRainMood("finished")
          );
        }
      );
    } catch {
      const response =
        "I couldn't reach my public knowledge layer. Try again in a moment.";

      setLines((previous) => [
        ...previous,
        {
          type: "out",
          text: response,
        },
      ]);

      speakRain(
        response,
        () => {
          setMood(
            getRainMood("speaking")
          );
        },
        () => {
          setMood(
            getRainMood("finished")
          );
        }
      );
    }

    setInput("");
  }

  /*
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
   */

  return (
    <div
      className={`rain-terminal ${
        compact
          ? "rain-terminal--compact"
          : ""
      }`}
    >
      <div
        className="rain-terminal__environment-layer"
        aria-hidden="true"
      >
        <RainEnvironment />

        <div className="rain-terminal__companion-layer">
          <RainCompanion
            mood={mood}
          />
        </div>
      </div>

      <div className="rain-terminal__shell">
        <div className="rain-terminal__chrome">
          <div className="rain-terminal__brand">
            <span className="rain-terminal__drop">
              ☁
            </span>

            <span>
              RAIN TERMINAL
            </span>

            <span className="rain-terminal__version">
              v3.0.0
            </span>
          </div>

          <div className="rain-terminal__live">
            <span /> LIVE RAIN
          </div>
        </div>

        <div
          ref={bodyRef}
          className="rain-terminal__body"
        >
          {lines.map((line, index) => (
            <div
              key={index}
              className={
                line.type === "in"
                  ? "rain-terminal__line rain-terminal__line--in"
                  : "rain-terminal__line rain-terminal__line--out"
              }
            >
              {line.type === "in" ? (
                <>
                  <span className="rain-terminal__prompt">
                    raghav@rain
                  </span>{" "}
                  ~ $ {line.text}
                </>
              ) : (
                line.text
              )}
            </div>
          ))}

          {weather.length > 0 && (
            <div className="rain-terminal__weather-strip">
              {weather
                .slice(0, 4)
                .map((item) => (
                  <span
                    key={`${item.city}-${item.country}`}
                  >
                    {item.city}{" "}
                    {item.precipitation.toFixed(
                      1
                    )}
                    mm/h
                  </span>
                ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rain-terminal__input"
        >
          <span className="rain-terminal__prompt">
            raghav@rain
          </span>

          <span>~ $</span>

          <input
            value={input}
            onChange={(e) => {
  const value = e.target.value;

  setInput(value);

  setMood(
    getRainMood(
      value.trim()
        ? "typing"
        : "reset"
    )
  );
}}
            placeholder="talk to Rain…"
            autoComplete="off"
            aria-label="Rain Terminal command"
          />
        </form>

        <div className="rain-terminal__footer">
          <span>
            type <b>help</b> · ask anything
            public ·{" "}
            <b>Rain speaks replies</b>
          </span>

          <span>
            ☂ ambient mode · <b>live</b>
          </span>
        </div>
      </div>
    </div>
  );
}