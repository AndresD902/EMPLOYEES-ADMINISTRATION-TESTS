import { performance } from "perf_hooks";
import type { PerformanceTarget } from "../config/services";

export interface EndpointMetrics {
  service: string;
  name: string;
  method: string;
  url: string;
  requests: number;
  expected: number;
  failed: number;
  errors: number;
  throughputRps: number;
  minMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  statusCounts: Record<string, number>;
}

export interface PerformanceReport {
  mode: "load" | "stress";
  startedAt: string;
  durationMs: number;
  concurrency: number;
  totalRequests: number;
  totalFailed: number;
  totalErrors: number;
  throughputRps: number;
  endpoints: EndpointMetrics[];
}

interface MutableMetrics {
  target: PerformanceTarget;
  durations: number[];
  expected: number;
  failed: number;
  errors: number;
  statusCounts: Record<string, number>;
}

export function metricKey(target: PerformanceTarget) {
  return `${target.service}:${target.name}`;
}

export function createBuckets(targets: PerformanceTarget[]) {
  return new Map(
    targets.map((target) => [
      metricKey(target),
      {
        target,
        durations: [],
        expected: 0,
        failed: 0,
        errors: 0,
        statusCounts: {},
      } satisfies MutableMetrics,
    ]),
  );
}

export async function measure(target: PerformanceTarget, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();

  try {
    const response = await fetch(target.url, {
      method: target.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: target.body ? JSON.stringify(target.body) : undefined,
      signal: controller.signal,
    });
    await response.arrayBuffer();
    return {
      status: response.status,
      durationMs: performance.now() - start,
      error: null,
    };
  } catch (error) {
    return {
      status: 0,
      durationMs: performance.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function record(
  buckets: Map<string, MutableMetrics>,
  target: PerformanceTarget,
  result: Awaited<ReturnType<typeof measure>>,
) {
  const bucket = buckets.get(metricKey(target));
  if (!bucket) return;

  bucket.durations.push(result.durationMs);
  bucket.statusCounts[String(result.status)] = (bucket.statusCounts[String(result.status)] ?? 0) + 1;

  if (result.error) {
    bucket.errors += 1;
    return;
  }

  if (target.expectedStatuses.includes(result.status)) {
    bucket.expected += 1;
  } else {
    bucket.failed += 1;
  }
}

export function summarize(
  mode: "load" | "stress",
  startedAt: string,
  durationMs: number,
  concurrency: number,
  buckets: Map<string, MutableMetrics>,
): PerformanceReport {
  const endpoints = Array.from(buckets.values()).map((bucket) => summarizeBucket(bucket, durationMs));
  const totalRequests = endpoints.reduce((sum, endpoint) => sum + endpoint.requests, 0);
  const totalFailed = endpoints.reduce((sum, endpoint) => sum + endpoint.failed, 0);
  const totalErrors = endpoints.reduce((sum, endpoint) => sum + endpoint.errors, 0);

  return {
    mode,
    startedAt,
    durationMs,
    concurrency,
    totalRequests,
    totalFailed,
    totalErrors,
    throughputRps: round(totalRequests / (durationMs / 1000)),
    endpoints,
  };
}

function summarizeBucket(bucket: MutableMetrics, durationMs: number): EndpointMetrics {
  const sorted = [...bucket.durations].sort((a, b) => a - b);
  const requests = sorted.length;

  return {
    service: bucket.target.service,
    name: bucket.target.name,
    method: bucket.target.method,
    url: bucket.target.url,
    requests,
    expected: bucket.expected,
    failed: bucket.failed,
    errors: bucket.errors,
    throughputRps: round(requests / (durationMs / 1000)),
    minMs: round(sorted[0] ?? 0),
    avgMs: round(requests ? sorted.reduce((sum, value) => sum + value, 0) / requests : 0),
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
    maxMs: round(sorted[sorted.length - 1] ?? 0),
    statusCounts: bucket.statusCounts,
  };
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return round(sorted[Math.max(0, Math.min(index, sorted.length - 1))]);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
