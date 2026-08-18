import type { CompanionMood } from "./RainCompanion";

export type RainBehaviorEvent =
  | "idle"
  | "reset"
  | "typing"
  | "submitted"
  | "speaking"
  | "finished"
  | "wave"
  | "dance"
  | "walk"
  | "roam"
  | "listen"
  | "think"
  | "laugh"
  | "type"
  | "success"
  | "error"
  | "long_running";

export function getRainMood(
  event: RainBehaviorEvent
): CompanionMood {
  switch (event) {
    case "typing":
    case "listen":
      return "listen";

    case "type":
      return "type";

    case "submitted":
    case "think":
    case "error":
    case "long_running":
      return "think";

    case "speaking":
      return "talk";

    case "success":
      return "talk";

    case "finished":
    case "reset":
    case "idle":
      return "idle";

    case "wave":
      return "wave";

    case "dance":
      return "dance";

    case "walk":
      return "walk";

    case "roam":
      return "roam";

    case "laugh":
      return "laugh";

    default:
      return "idle";
  }
}
