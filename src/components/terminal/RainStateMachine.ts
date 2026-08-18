import type { CompanionMood } from "./RainCompanion";

export interface RainState {
  current: CompanionMood;
  previous: CompanionMood;
  enteredAt: number;
  transitionStartedAt: number;
}

export const RAIN_TRANSITION_SECONDS: Record<CompanionMood, number> = {
  idle: 0.55,
  listen: 0.38,
  wave: 0.22,
  talk: 0.28,
  think: 0.5,
  laugh: 0.2,
  dance: 0.3,
  walk: 0.45,
  roam: 0.6,
  type: 0.42,
};

export function createRainState(
  mood: CompanionMood,
  now = 0
): RainState {
  return {
    current: mood,
    previous: mood,
    enteredAt: now,
    transitionStartedAt: now,
  };
}

export function requestRainState(
  state: RainState,
  requested: CompanionMood,
  now: number
): RainState {
  if (state.current === requested) return state;

  return {
    current: requested,
    previous: state.current,
    enteredAt: now,
    transitionStartedAt: now,
  };
}

export function getRainTransitionProgress(
  state: RainState,
  now: number
): number {
  const duration =
    RAIN_TRANSITION_SECONDS[state.current] ?? 0.4;

  if (duration <= 0) return 1;

  return Math.min(
    1,
    Math.max(
      0,
      (now - state.transitionStartedAt) / duration
    )
  );
}

export function getRainStateElapsed(
  state: RainState,
  now: number
): number {
  return Math.max(0, now - state.enteredAt);
}
