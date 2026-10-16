/** Create an empty run controller. Scenarios and completed records are owned by callers. */
export function createExperimentState() {
  return { active: null, completed: [] };
}

/** Start a new scenario while retaining completed runs for comparison. */
export function startExperiment(state, scenario, prediction) {
  return {
    ...state,
    active: { scenario, prediction, stepIndex: 0 },
  };
}

/** Advance one step and record a completed run exactly once. */
export function advanceExperiment(state, stepCount, createRecord) {
  if (!state.active || state.active.stepIndex >= stepCount) return state;
  const stepIndex = state.active.stepIndex + 1;
  const active = { ...state.active, stepIndex };
  if (stepIndex < stepCount) return { ...state, active };
  return {
    active,
    completed: [createRecord(active), ...state.completed].slice(0, 5),
  };
}

/** Run all remaining steps from the current position. */
export function runAllExperimentSteps(state, stepCount, createRecord) {
  if (!state.active || state.active.stepIndex >= stepCount) return state;
  const active = { ...state.active, stepIndex: stepCount };
  return {
    active,
    completed: [createRecord(active), ...state.completed].slice(0, 5),
  };
}

/** Replay the most recently completed scenario from its first step. */
export function replayExperiment(state) {
  const last = state.completed[0];
  if (!last) return state;
  return {
    ...state,
    active: { scenario: last.scenario, prediction: last.prediction, stepIndex: 0 },
  };
}

/** Reset active and completed state. */
export function resetExperiment() {
  return createExperimentState();
}
