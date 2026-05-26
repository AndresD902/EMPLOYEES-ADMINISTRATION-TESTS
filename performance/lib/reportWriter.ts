import fs from "fs";
import path from "path";
import type { PerformanceReport } from "./metrics";

export function writeReports(report: PerformanceReport) {
  const reportsDir = path.resolve(__dirname, "..", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const stamp = new Date(report.startedAt).toISOString().replace(/[:.]/g, "-");
  const base = `performance-${report.mode}-${stamp}`;
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const mdPath = path.join(reportsDir, `${base}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(mdPath, toMarkdown(report), "utf8");

  return { jsonPath, mdPath };
}

function toMarkdown(report: PerformanceReport) {
  const lines = [
    `# Performance ${report.mode}`,
    "",
    `- Started at: ${report.startedAt}`,
    `- Duration: ${report.durationMs} ms`,
    `- Concurrency: ${report.concurrency}`,
    `- Total requests: ${report.totalRequests}`,
    `- Throughput: ${report.throughputRps} req/s`,
    `- Failures: ${report.totalFailed}`,
    `- Errors: ${report.totalErrors}`,
    "",
    "| Service | Endpoint | Requests | Expected | Failed | Errors | Avg ms | P95 ms | P99 ms | RPS | Statuses |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
  ];

  for (const endpoint of report.endpoints) {
    lines.push([
      endpoint.service,
      `${endpoint.method} ${endpoint.name}`,
      endpoint.requests,
      endpoint.expected,
      endpoint.failed,
      endpoint.errors,
      endpoint.avgMs,
      endpoint.p95Ms,
      endpoint.p99Ms,
      endpoint.throughputRps,
      Object.entries(endpoint.statusCounts).map(([status, count]) => `${status}:${count}`).join(", "),
    ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  return `${lines.join("\n")}\n`;
}
