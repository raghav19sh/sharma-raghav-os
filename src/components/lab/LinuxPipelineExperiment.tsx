"use client";

import { useMemo, useState } from "react";
import ExperimentRunner from "@/components/lab/ExperimentRunner";
import {
  createPipelineSteps,
  displayPipelineFile,
  simulatePipeline,
  type PipelineFileState as FileState,
  type PipelineScenario as Scenario,
} from "@/lib/lab/pipeline-model.mjs";
import {
  advanceExperiment,
  createExperimentState,
  replayExperiment,
  resetExperiment,
  runAllExperimentSteps,
  startExperiment,
} from "@/lib/lab/experiment-engine.mjs";

type RedirectMode = Scenario["redirect"];
type CompletedRun = {
  scenario: Scenario;
  prediction: string;
  fileAfter: FileState;
  exitStatus: 0 | 1;
};

const initialScenario: Scenario = {
  lines: "alpha\nbeta\nbeta-two",
  pattern: "beta",
  redirect: ">",
  fileExists: true,
  fileBefore: "previous result\n",
};

const experimentQuestion = "What will grep write to result.txt, and what happens to the file’s previous contents?";

function scenarioLabel(scenario: Scenario) {
  return `${scenario.redirect} ${scenario.fileExists ? "existing file" : "new file"}`;
}

function notesText(prediction: string, scenario: Scenario, stepIndex: number, runs: CompletedRun[]) {
  const result = simulatePipeline(scenario);
  const steps = createPipelineSteps(scenario);
  const lines = [
    "# Experiment notes: Linux pipeline and output redirection",
    `Exported: ${new Date().toISOString()}`,
    "Result type: browser simulation; no shell commands were executed by the page.",
    "",
    `## Research question\n${experimentQuestion}`,
    `## Prediction\n${prediction.trim() || "No prediction entered."}`,
    "## Current scenario",
    `- Producer lines: ${JSON.stringify(scenario.lines)}`,
    `- Literal grep pattern: ${JSON.stringify(scenario.pattern)}`,
    `- Redirect operator: ${scenario.redirect}`,
    `- Destination existed before run: ${scenario.fileExists ? "yes" : "no"}`,
    `- File contents before run: ${JSON.stringify(displayPipelineFile(result.before))}`,
    `- Completed steps: ${stepIndex} of ${steps.length}`,
    "",
    "## Modeled observations",
    ...steps.slice(0, stepIndex).flatMap((step, index) => [`${index + 1}. ${step.title}`, `   ${step.observation}`]),
    `- File contents after current step: ${JSON.stringify(displayPipelineFile(stepIndex === 0 ? result.before : stepIndex === 1 ? result.afterOpen : stepIndex === 2 ? result.afterOpen : result.afterWrite))}`,
    "",
    "## Completed scenario runs",
    ...(runs.length ? runs.map((run, index) => `${index + 1}. ${scenarioLabel(run.scenario)}; pattern ${JSON.stringify(run.scenario.pattern)}; before ${JSON.stringify(displayPipelineFile(simulatePipeline(run.scenario).before))}; after ${JSON.stringify(displayPipelineFile(run.fileAfter))}; modeled grep status ${run.exitStatus}.`) : ["No scenario run has been completed yet."]),
    "",
    "## Interpretation and limitations",
    "In ordinary shell behavior, > creates or truncates a destination before command output is written, while >> appends. This model abstracts process scheduling, kernel pipe capacity, locale, filesystem errors, shell options such as noclobber, and utility-specific behavior. Reproduce the fixed command in a disposable directory and consult the linked standards for the target shell.",
  ];
  return lines.join("\n");
}

export default function LinuxPipelineExperiment() {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [prediction, setPrediction] = useState("");
  const [engine, setEngine] = useState(() => createExperimentState<Scenario, CompletedRun>());
  const activeScenario = engine.active?.scenario ?? null;
  const activePrediction = engine.active?.prediction ?? "";
  const stepIndex = engine.active?.stepIndex ?? 0;
  const completedRuns = engine.completed;

  const snapshot = activeScenario ?? scenario;
  const steps = useMemo(() => createPipelineSteps(snapshot), [snapshot]);
  const result = useMemo(() => simulatePipeline(snapshot), [snapshot]);
  const currentFile = stepIndex === 0
    ? result.before
    : stepIndex === 1
      ? result.afterOpen
      : stepIndex === 2
        ? result.afterOpen
        : result.afterWrite;
  const isComplete = activeScenario !== null && stepIndex === steps.length;

  function createCompletedRun(run: { scenario: Scenario; prediction: string }): CompletedRun {
    const simulated = simulatePipeline(run.scenario);
    return {
      scenario: run.scenario,
      prediction: run.prediction,
      fileAfter: simulated.afterWrite,
      exitStatus: simulated.exitStatus,
    };
  }

  function startCurrent() {
    setEngine((current) => startExperiment(current, { ...scenario }, prediction));
  }

  function runNext() {
    setEngine((current) => advanceExperiment(current, steps.length, createCompletedRun));
  }

  function runAllRemaining() {
    setEngine((current) => runAllExperimentSteps(current, steps.length, createCompletedRun));
  }

  function replayLast() {
    setEngine((current) => replayExperiment(current));
  }

  function reset() {
    setScenario(initialScenario);
    setPrediction("");
    setEngine(resetExperiment());
  }

  const predictionResult = !isComplete
    ? ""
    : activePrediction.trim()
      ? activePrediction.trim() === displayPipelineFile(result.afterWrite).trim()
        ? "Prediction matches the modeled final file (surrounding whitespace ignored)."
        : "Prediction differs from the modeled final file. Compare the observed lines with what you expected."
      : "No prediction was entered before this run.";
  const currentState = stepIndex === 0
    ? `Before execution: result.txt ${snapshot.fileExists ? "exists" : "does not exist"}; contents ${JSON.stringify(displayPipelineFile(result.before))}. No steps have run.`
    : `Modeled file state: ${JSON.stringify(displayPipelineFile(currentFile))}`;
  const statusMessage = !activeScenario
    ? "Not started"
    : isComplete
      ? `Complete · ${predictionResult}`
      : `Ready for step ${stepIndex + 1} of ${steps.length}`;

  const comparison = <div className="lab-run-comparison">
    <div className="lab-comparison-heading"><div><p className="lab-runner-kicker">04 / BEFORE &amp; AFTER · SCENARIO COMPARISON</p><h3>What changed in result.txt?</h3></div><span>{completedRuns.length} completed run{completedRuns.length === 1 ? "" : "s"}</span></div>
    {completedRuns.length === 0 ? <p className="lab-runner-hint">Complete a run to capture a before/after record. Change the redirect mode or starting file and run again to compare scenarios.</p> :
      <div className="lab-comparison-grid">{completedRuns.slice(0, 2).map((run, index) => {
        const before = simulatePipeline(run.scenario).before;
        return <article className="lab-comparison-card" key={`${scenarioLabel(run.scenario)}-${index}`}>
          <p>RUN {completedRuns.length - index} · {scenarioLabel(run.scenario)}</p>
          <dl><div><dt>Before</dt><dd><pre>{displayPipelineFile(before)}</pre></dd></div><div><dt>After</dt><dd><pre>{displayPipelineFile(run.fileAfter)}</pre></dd></div></dl>
          <small>{run.scenario.lines.split("\n").filter((line) => line.includes(run.scenario.pattern)).length} matching lines · modeled grep status {run.exitStatus}</small>
        </article>;
      })}</div>}
    {isComplete && <p className="lab-prediction-result" role="status">{predictionResult}</p>}
  </div>;

  const noteText = notesText(activeScenario ? activePrediction : prediction, snapshot, stepIndex, completedRuns);
  const controls = <div className="lab-pipeline-controls">
    <label className="lab-scenario-field" htmlFor="pipeline-lines"><span>Producer lines</span><textarea id="pipeline-lines" value={scenario.lines} maxLength={500} rows={3} onChange={(event) => setScenario((current) => ({ ...current, lines: event.target.value }))} /><small>Each line is modeled as text followed by a newline.</small></label>
    <label className="lab-scenario-field" htmlFor="pipeline-pattern"><span>Literal grep pattern</span><input id="pipeline-pattern" value={scenario.pattern} maxLength={80} onChange={(event) => setScenario((current) => ({ ...current, pattern: event.target.value }))} /><small>Substring match, equivalent to grep -F for this simple text scenario.</small></label>
    <div className="lab-scenario-row">
      <label className="lab-scenario-field" htmlFor="pipeline-redirect"><span>Output redirection</span><select id="pipeline-redirect" value={scenario.redirect} onChange={(event) => setScenario((current) => ({ ...current, redirect: event.target.value as RedirectMode }))}><option value=">">&gt; overwrite / create</option><option value=">>">&gt;&gt; append / create</option></select></label>
      <label className="lab-file-exists"><input type="checkbox" checked={scenario.fileExists} onChange={(event) => setScenario((current) => ({ ...current, fileExists: event.target.checked }))} /><span>result.txt already exists</span></label>
    </div>
    <label className="lab-scenario-field" htmlFor="pipeline-existing-content"><span>Existing file contents</span><textarea id="pipeline-existing-content" value={scenario.fileBefore} maxLength={500} rows={2} disabled={!scenario.fileExists} onChange={(event) => setScenario((current) => ({ ...current, fileBefore: event.target.value }))} /><small>These bytes matter for overwrite versus append.</small></label>
    <p className="lab-target-note">Destination: <code>result.txt</code> · {activeScenario ? "The current run uses settings captured when it started; these controls configure the next run." : "Only this fixed filename is modeled; no local file is accessed."}</p>
  </div>;

  return <>
    <ExperimentRunner
      id="linux-pipeline"
      label="EXPERIMENT 01 / LINUX SHELL MODEL"
      title="Pipes & output redirection"
      question={experimentQuestion}
      prediction={activeScenario && !isComplete ? activePrediction : prediction}
      predictionLabel={isComplete ? "Set a prediction for the next run. The completed run keeps its captured prediction." : "What do you predict will be in the file after the pipeline?"}
      predictionDisabled={activeScenario !== null && !isComplete}
      onPredictionChange={setPrediction}
      controls={controls}
      steps={steps}
      stepIndex={stepIndex}
      currentState={currentState}
      onStart={startCurrent}
      onNext={runNext}
      onRunAll={runAllRemaining}
      onReplay={replayLast}
      onReset={reset}
      isStarted={activeScenario !== null}
      canReplay={completedRuns.length > 0}
      comparison={comparison}
      notes={noteText}
      statusMessage={statusMessage}
    />
    <section id="note-pipeline-redirection" className="lab-field-note" aria-labelledby="pipeline-note-title">
      <div className="lab-field-note-head"><div><p className="lab-runner-kicker">FIELD NOTE 001 / PUBLISHED INVESTIGATION</p><h2 id="pipeline-note-title">A pipe is a connection; redirection changes the destination</h2></div><span>TESTED · /bin/sh · DARWIN 25.4.0</span></div>
      <div className="lab-field-note-grid">
        <div><h3>Research question</h3><p>When a pipeline writes matching lines to an existing file, how do <code>&gt;</code> and <code>&gt;&gt;</code> change the result?</p></div>
        <div><h3>Reproducible procedure</h3><p>In a disposable directory, run this sequence, then repeat with <code>&gt;&gt;</code> in place of the first <code>&gt;</code>:</p><pre>printf 'previous result\n' &gt; result.txt<br />printf 'alpha\nbeta\nbeta-two\n' | grep -F -- beta &gt; result.txt<br />cat result.txt</pre></div>
        <div><h3>Tested observations</h3><p>On a local Darwin 25.4.0 environment using <code>/bin/sh</code>, overwrite produced <code>beta</code> and <code>beta-two</code>; append produced <code>previous result</code>, <code>beta</code>, and <code>beta-two</code>. Both pipelines exited 0 with empty stderr. This records a macOS observation, not a Linux test.</p></div>
        <div><h3>Interpretation</h3><p>The shell connects the producer’s standard output to the consumer’s standard input. The redirection on the final command sends its standard output to the file. <code>&gt;</code> creates or truncates that destination; <code>&gt;&gt;</code> opens it for appending. The simulator shows the resulting logical stream and file state, not process scheduling.</p></div>
        <div><h3>Limitations</h3><p>The test was run on macOS, not Linux. Shell options, implementation details, file errors, locale, and command versions can affect behavior. The browser experiment is a deterministic model; it does not access the host shell or filesystem. Repeat in a disposable Linux directory before treating the observation as Linux-specific.</p></div>
        <div><h3>Authoritative references</h3><p><a href="https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html" target="_blank" rel="noreferrer">POSIX.1-2024 Shell Command Language</a> · <a href="https://www.gnu.org/s/bash/manual/html_node/Redirections.html" target="_blank" rel="noreferrer">GNU Bash Reference: Redirections</a></p></div>
      </div>
      <p className="lab-related-experiment"><a href="#experiment-runner">Open the related interactive experiment ↑</a></p>
    </section>
  </>;
}
