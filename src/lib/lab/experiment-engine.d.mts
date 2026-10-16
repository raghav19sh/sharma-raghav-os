export type ActiveExperimentRun<Scenario> = {
  scenario: Scenario;
  prediction: string;
  stepIndex: number;
};

export type ExperimentState<Scenario, Record> = {
  active: ActiveExperimentRun<Scenario> | null;
  completed: Record[];
};

export function createExperimentState<Scenario = unknown, Record = unknown>(): ExperimentState<Scenario, Record>;
export function startExperiment<Scenario, Record>(state: ExperimentState<Scenario, Record>, scenario: Scenario, prediction: string): ExperimentState<Scenario, Record>;
export function advanceExperiment<Scenario, Record>(state: ExperimentState<Scenario, Record>, stepCount: number, createRecord: (run: ActiveExperimentRun<Scenario>) => Record): ExperimentState<Scenario, Record>;
export function runAllExperimentSteps<Scenario, Record>(state: ExperimentState<Scenario, Record>, stepCount: number, createRecord: (run: ActiveExperimentRun<Scenario>) => Record): ExperimentState<Scenario, Record>;
export function replayExperiment<Scenario, Record extends { scenario: Scenario; prediction: string }>(state: ExperimentState<Scenario, Record>): ExperimentState<Scenario, Record>;
export function resetExperiment<Scenario = unknown, Record = unknown>(): ExperimentState<Scenario, Record>;
