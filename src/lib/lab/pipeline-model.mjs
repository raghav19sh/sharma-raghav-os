/**
 * Deterministic browser-side model of a small `printf | grep -F > file` scenario.
 * It never invokes a shell and intentionally abstracts scheduling and pipe capacity.
 * @param {{lines: string, pattern: string, redirect: ">"|">>", fileExists: boolean, fileBefore: string}} scenario
 */
export function simulatePipeline(scenario) {
  const lines = scenario.lines === "" ? [] : scenario.lines.split("\n");
  const pipeText = lines.map((line) => `${line}\n`).join("");
  const matches = lines.filter((line) => line.includes(scenario.pattern));
  const output = matches.map((line) => `${line}\n`).join("");
  const before = {
    exists: scenario.fileExists,
    content: scenario.fileExists ? scenario.fileBefore : "",
  };
  const afterOpen = scenario.redirect === ">"
    ? { exists: true, content: "" }
    : { exists: true, content: before.content };
  const afterWrite = {
    exists: true,
    content: scenario.redirect === ">" ? output : `${before.content}${output}`,
  };

  return {
    lines,
    pipeText,
    matches,
    output,
    before,
    afterOpen,
    afterWrite,
    exitStatus: matches.length > 0 ? 0 : 1,
  };
}

/** @param {{exists: boolean, content: string}} file */
export function displayPipelineFile(file) {
  if (!file.exists) return "(file does not exist)";
  if (!file.content) return "(empty file)";
  return file.content;
}

/**
 * Build the three observable states used by the reusable experiment runner.
 * @param {{lines: string, pattern: string, redirect: ">"|">>", fileExists: boolean, fileBefore: string}} scenario
 */
export function createPipelineSteps(scenario) {
  const result = simulatePipeline(scenario);
  const before = displayPipelineFile(result.before);
  const afterOpen = displayPipelineFile(result.afterOpen);
  const afterWrite = displayPipelineFile(result.afterWrite);
  return [
    {
      title: "The shell connects the pipeline and opens the destination",
      explanation: `stdout from the producer is connected to grep’s stdin. The shell opens result.txt for ${scenario.redirect === ">" ? "writing with >, which creates or truncates it" : "appending with >>, preserving existing bytes"}. stderr remains connected to the terminal in this scenario.`,
      observation: `Before: ${JSON.stringify(before)} · after opening: ${JSON.stringify(afterOpen)}`,
    },
    {
      title: "The producer writes lines to the pipe",
      explanation: "printf writes each configured line followed by a newline. The simulation shows the logical byte stream as one view; a real kernel pipe has finite buffering and the processes may run concurrently.",
      observation: result.pipeText ? JSON.stringify(result.pipeText) : "No bytes were written to the pipe.",
    },
    {
      title: "grep filters the stream and writes to the redirected file",
      explanation: "grep -F treats the configured pattern as a literal substring. Matching lines go to stdout, which is connected to result.txt. No match gives grep status 1; it is not an execution error in this model.",
      observation: `${result.matches.length} matching line(s) · modeled grep status ${result.exitStatus} · after: ${JSON.stringify(afterWrite || "(empty file)")}`,
    },
  ];
}
