"use client";

import { Download, Play, RotateCcw, SkipForward } from "lucide-react";
import type { ReactNode } from "react";

export type ExperimentStep = {
  title: string;
  explanation: string;
  observation: string;
};

type ExperimentRunnerProps = {
  id: string;
  label: string;
  title: string;
  question: string;
  prediction: string;
  predictionLabel: string;
  predictionDisabled: boolean;
  onPredictionChange: (value: string) => void;
  controls: ReactNode;
  steps: ExperimentStep[];
  stepIndex: number;
  currentState: string;
  onStart: () => void;
  onNext: () => void;
  onRunAll: () => void;
  onReplay: () => void;
  onReset: () => void;
  isStarted: boolean;
  canReplay: boolean;
  comparison: ReactNode;
  notes: string;
  statusMessage: string;
};

export default function ExperimentRunner({
  id,
  label,
  title,
  question,
  prediction,
  predictionLabel,
  predictionDisabled,
  onPredictionChange,
  controls,
  steps,
  stepIndex,
  currentState,
  onStart,
  onNext,
  onRunAll,
  onReplay,
  onReset,
  isStarted,
  canReplay,
  comparison,
  notes,
  statusMessage,
}: ExperimentRunnerProps) {
  function exportNotes() {
    const blob = new Blob([notes], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}-experiment-notes.md`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section id="experiment-runner" className="lab-experiment lab-runner" aria-labelledby={`${id}-title`}>
      <div className="lab-exp-heading">
        <span className="lab-exp-icon"><Play size={17} /></span>
        <div>
          <p>{label}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <span>{question}</span>
        </div>
      </div>

      <p className="lab-sim-note" role="note">
        SIMULATION · No shell command runs and no data leaves this browser. The steps model the logical stream and file contents; real scheduling and pipe buffering are not simulated.
      </p>

      <div className="lab-runner-question">
        <p className="lab-runner-kicker">01 / QUESTION &amp; PREDICTION</p>
        <p className="lab-runner-question-text">{question}</p>
        <label htmlFor={`${id}-prediction`}>{predictionLabel}</label>
        <textarea
          id={`${id}-prediction`}
          value={prediction}
          onChange={(event) => onPredictionChange(event.target.value)}
          placeholder="Write a short prediction before you run the steps…"
          rows={2}
          disabled={predictionDisabled}
        />
      </div>

      <div className="lab-runner-controls">
        <p className="lab-runner-kicker">02 / CONTROLLED SCENARIO</p>
        {controls}
      </div>

      <div className="lab-runner-actions" aria-label="Experiment controls">
        <button className="lab-runner-primary" onClick={onStart}><Play size={13} /> START CURRENT SCENARIO</button>
        <button onClick={onNext} disabled={!isStarted || stepIndex >= steps.length}><SkipForward size={13} /> RUN NEXT STEP</button>
        <button onClick={onRunAll} disabled={!isStarted || stepIndex >= steps.length}>RUN ALL REMAINING</button>
        <button onClick={onReplay} disabled={!canReplay}><RotateCcw size={13} /> REPLAY LAST</button>
        <button onClick={onReset}><RotateCcw size={13} /> RESET</button>
      </div>
      <p className="lab-runner-hint">Start captures the current settings. Edit the controls and start again to compare scenarios. Replay reruns the last completed settings.</p>

      <div className="lab-runner-state" aria-live="polite" aria-atomic="true">
        <div><p className="lab-runner-kicker">03 / OBSERVABLE STATE · STEP {stepIndex} OF {steps.length}</p><p>{currentState}</p></div>
        <span className="lab-runner-status">{statusMessage}</span>
      </div>

      <ol className="lab-runner-steps" aria-label="Experiment execution steps">
        {steps.map((step, index) => {
          const done = stepIndex > index;
          const current = stepIndex === index + 1;
          return <li key={step.title} className={done ? "is-done" : current ? "is-current" : ""}>
            <span className="lab-step-number">0{index + 1}</span>
            <div><h3>{step.title}</h3><p>{step.explanation}</p>
              {stepIndex >= index + 1 && <p className="lab-step-observation"><strong>Observed state:</strong> {step.observation}</p>}
            </div>
            <span className="lab-step-status">{done ? "DONE" : current ? "NOW" : "NEXT"}</span>
          </li>;
        })}
      </ol>

      {comparison}
      <div className="lab-runner-export">
        <p>Notes include the question, your prediction, scenario settings, observed steps, and any completed comparisons.</p>
        <button onClick={exportNotes}><Download size={14} /> EXPORT EXPERIMENT NOTES</button>
      </div>
    </section>
  );
}
