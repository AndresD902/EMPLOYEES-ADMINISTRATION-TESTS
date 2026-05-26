import { performanceTargets } from "./config/services";
import { createBuckets, measure, record, summarize } from "./lib/metrics";
import { writeReports } from "./lib/reportWriter";

type Mode = "load" | "stress";

interface Profile {
  durationMs: number;
  concurrency: number;
  timeoutMs: number;
}

const mode = parseMode(process.argv[2]);
const profile = getProfile(mode);

async function main() {
  const startedAt = new Date().toISOString();
  const buckets = createBuckets(performanceTargets);
  const deadline = Date.now() + profile.durationMs;
  let cursor = 0;

  async function worker() {
    while (Date.now() < deadline) {
      const target = performanceTargets[cursor % performanceTargets.length];
      cursor += 1;
      const result = await measure(target, profile.timeoutMs);
      record(buckets, target, result);
    }
  }

  await Promise.all(Array.from({ length: profile.concurrency }, () => worker()));

  const report = summarize(mode, startedAt, profile.durationMs, profile.concurrency, buckets);
  const paths = writeReports(report);

  console.log(`Performance ${mode} completed`);
  console.log(`Requests: ${report.totalRequests}`);
  console.log(`Throughput: ${report.throughputRps} req/s`);
  console.log(`Failures: ${report.totalFailed}`);
  console.log(`Errors: ${report.totalErrors}`);
  console.log(`JSON report: ${paths.jsonPath}`);
  console.log(`Markdown report: ${paths.mdPath}`);

  if (report.totalFailed > 0 || report.totalErrors > 0) {
    process.exitCode = 1;
  }
}

function parseMode(value: string | undefined): Mode {
  if (value === "load" || value === "stress") return value;
  throw new Error("Usage: ts-node performance/run.ts <load|stress>");
}

function getProfile(selectedMode: Mode): Profile {
  if (selectedMode === "load") {
    return {
      durationMs: Number(process.env.PERF_LOAD_DURATION_MS ?? 15000),
      concurrency: Number(process.env.PERF_LOAD_CONCURRENCY ?? 8),
      timeoutMs: Number(process.env.PERF_TIMEOUT_MS ?? 5000),
    };
  }

  return {
    durationMs: Number(process.env.PERF_STRESS_DURATION_MS ?? 20000),
    concurrency: Number(process.env.PERF_STRESS_CONCURRENCY ?? 24),
    timeoutMs: Number(process.env.PERF_TIMEOUT_MS ?? 5000),
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
