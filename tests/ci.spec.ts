import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parse } from "yaml";

test("TEST-01 npm test gera os builds e roda a suíte Playwright", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const steps = pkg.scripts.test.split("&&").map((s: string) => s.trim());
  expect(steps).toEqual(["npm run build", "npm run build:test", "playwright test"]);
});

type Step = {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, unknown>;
  if?: string;
  "continue-on-error"?: unknown;
};

type Job = {
  if?: string;
  needs?: string | string[];
  "continue-on-error"?: unknown;
  env?: Record<string, unknown>;
  steps?: Step[];
};

const workflow = parse(readFileSync(".github/workflows/deploy.yml", "utf8")) as {
  jobs: Record<string, Job>;
};

const needsOf = (job: Job): string[] => ([] as string[]).concat(job.needs ?? []);

test("TEST-02 o job test roda npm test e deploy depende dele", () => {
  const testJob = workflow.jobs.test;
  expect(testJob).toBeDefined();
  const runsNpmTest = (testJob.steps ?? []).some((step) => step.run === "npm test");
  expect(runsNpmTest).toBe(true);
  expect(needsOf(workflow.jobs.deploy)).toContain("test");
});

test("TEST-03 nenhum if ou continue-on-error deixa deploy rodar com test vermelho", () => {
  const { deploy, test: testJob } = workflow.jobs;
  expect(deploy.if).toBeUndefined();
  expect(testJob["continue-on-error"]).toBeUndefined();
  for (const step of testJob.steps ?? []) {
    expect(step["continue-on-error"]).toBeUndefined();
  }
  expect(needsOf(deploy)).toEqual(expect.arrayContaining(["test", "build"]));
});

test("TEST-04 o artefato vem do npm run build do job build, sem GARDEN_EXAMPLES", () => {
  const build = workflow.jobs.build;
  expect((build.steps ?? []).some((step) => step.run === "npm run build")).toBe(true);
  const upload = (build.steps ?? []).find((step) =>
    step.uses?.startsWith("actions/upload-pages-artifact"),
  );
  expect(upload?.with?.path).toBe("build");
  expect(JSON.stringify(build)).not.toContain("GARDEN_EXAMPLES");
});
