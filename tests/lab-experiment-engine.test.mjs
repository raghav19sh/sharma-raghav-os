import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceExperiment,
  createExperimentState,
  replayExperiment,
  resetExperiment,
  runAllExperimentSteps,
  startExperiment,
} from "../src/lib/lab/experiment-engine.mjs";

const record = (run) => ({ scenario: run.scenario, prediction: run.prediction, stepIndex: run.stepIndex });

test("start captures scenario and prediction without running a step", () => {
  const state = startExperiment(createExperimentState(), { redirect: ">" }, "overwrite");
  assert.deepEqual(state.active, { scenario: { redirect: ">" }, prediction: "overwrite", stepIndex: 0 });
  assert.deepEqual(state.completed, []);
});

test("advance moves one step and records only on the final step", () => {
  let state = startExperiment(createExperimentState(), { redirect: ">>" }, "append");
  state = advanceExperiment(state, 3, record);
  assert.equal(state.active.stepIndex, 1);
  assert.equal(state.completed.length, 0);
  state = advanceExperiment(state, 3, record);
  state = advanceExperiment(state, 3, record);
  assert.equal(state.active.stepIndex, 3);
  assert.deepEqual(state.completed, [{ scenario: { redirect: ">>" }, prediction: "append", stepIndex: 3 }]);
  assert.equal(advanceExperiment(state, 3, record), state);
});

test("run all completes a started run from its current step", () => {
  let state = startExperiment(createExperimentState(), { id: 1 }, "prediction");
  state = advanceExperiment(state, 3, record);
  state = runAllExperimentSteps(state, 3, record);
  assert.equal(state.active.stepIndex, 3);
  assert.equal(state.completed.length, 1);
  assert.equal(state.completed[0].stepIndex, 3);
});

test("replay restores the latest completed scenario at step zero", () => {
  let state = startExperiment(createExperimentState(), { id: 1 }, "first");
  state = runAllExperimentSteps(state, 2, record);
  state = startExperiment(state, { id: 2 }, "second");
  state = runAllExperimentSteps(state, 2, record);
  const replayed = replayExperiment(state);
  assert.deepEqual(replayed.active, { scenario: { id: 2 }, prediction: "second", stepIndex: 0 });
  assert.equal(replayed.completed.length, 2);
});

test("reset clears active and comparison history; unstarted controls are inert", () => {
  const empty = createExperimentState();
  assert.equal(advanceExperiment(empty, 3, record), empty);
  assert.equal(runAllExperimentSteps(empty, 3, record), empty);
  assert.equal(replayExperiment(empty), empty);
  const completed = runAllExperimentSteps(startExperiment(empty, { id: 1 }, "p"), 1, record);
  assert.deepEqual(resetExperiment(), { active: null, completed: [] });
  assert.equal(resetExperiment().completed.length, 0);
  assert.equal(completed.completed.length, 1);
});
