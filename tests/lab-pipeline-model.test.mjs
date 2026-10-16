import assert from "node:assert/strict";
import test from "node:test";
import { createPipelineSteps, displayPipelineFile, simulatePipeline } from "../src/lib/lab/pipeline-model.mjs";

const scenario = (overrides = {}) => ({
  lines: "alpha\nbeta\nbeta-two",
  pattern: "beta",
  redirect: ">",
  fileExists: true,
  fileBefore: "previous result\n",
  ...overrides,
});

test("overwrite truncates an existing file before matching output is written", () => {
  const result = simulatePipeline(scenario());
  assert.equal(result.before.content, "previous result\n");
  assert.equal(result.afterOpen.content, "");
  assert.equal(result.pipeText, "alpha\nbeta\nbeta-two\n");
  assert.equal(result.output, "beta\nbeta-two\n");
  assert.deepEqual(result.matches, ["beta", "beta-two"]);
  assert.deepEqual(result.afterWrite, { exists: true, content: "beta\nbeta-two\n" });
  assert.equal(result.exitStatus, 0);
});

test("append preserves existing bytes exactly, without inserting a newline", () => {
  const result = simulatePipeline(scenario({ redirect: ">>", fileBefore: "prior" }));
  assert.equal(result.afterOpen.content, "prior");
  assert.equal(result.afterWrite.content, "priorbeta\nbeta-two\n");
});

test("a no-match overwrite leaves a created, empty file and grep status 1", () => {
  const result = simulatePipeline(scenario({ pattern: "missing" }));
  assert.deepEqual(result.matches, []);
  assert.deepEqual(result.afterWrite, { exists: true, content: "" });
  assert.equal(result.exitStatus, 1);
});

test("a no-match append leaves existing content unchanged", () => {
  const result = simulatePipeline(scenario({ redirect: ">>", pattern: "missing" }));
  assert.equal(result.afterWrite.content, "previous result\n");
  assert.equal(result.exitStatus, 1);
});

test("append to a missing destination creates it and writes matching output", () => {
  const result = simulatePipeline(scenario({ redirect: ">>", fileExists: false, fileBefore: "ignored" }));
  assert.deepEqual(result.before, { exists: false, content: "" });
  assert.equal(result.afterWrite.content, "beta\nbeta-two\n");
});

test("step explanations expose file open, logical stream, and write observations", () => {
  const steps = createPipelineSteps(scenario());
  assert.equal(steps.length, 3);
  assert.match(steps[0].observation, /after opening: "\(empty file\)"/);
  assert.match(steps[1].observation, /alpha\\nbeta\\nbeta-two/);
  assert.match(steps[2].observation, /modeled grep status 0/);
  assert.equal(displayPipelineFile({ exists: false, content: "" }), "(file does not exist)");
});
