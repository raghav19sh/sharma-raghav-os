export type PipelineScenario = {
  lines: string;
  pattern: string;
  redirect: ">" | ">>";
  fileExists: boolean;
  fileBefore: string;
};

export type PipelineFileState = {
  exists: boolean;
  content: string;
};

export type PipelineResult = {
  lines: string[];
  pipeText: string;
  matches: string[];
  output: string;
  before: PipelineFileState;
  afterOpen: PipelineFileState;
  afterWrite: PipelineFileState;
  exitStatus: 0 | 1;
};

export type PipelineStep = {
  title: string;
  explanation: string;
  observation: string;
};

export function simulatePipeline(scenario: PipelineScenario): PipelineResult;
export function displayPipelineFile(file: PipelineFileState): string;
export function createPipelineSteps(scenario: PipelineScenario): PipelineStep[];
