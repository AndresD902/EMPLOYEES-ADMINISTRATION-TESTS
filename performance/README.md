# Performance tests

These load and stress tests hit the real local microservices. They do not use mocks or stubs.

## Commands

- `npm run perf:load`
- `npm run perf:stress`
- `npm run perf`

## Tunables

- `PERF_LOAD_DURATION_MS`
- `PERF_LOAD_CONCURRENCY`
- `PERF_STRESS_DURATION_MS`
- `PERF_STRESS_CONCURRENCY`
- `PERF_TIMEOUT_MS`

Reports are written to `performance/reports` as JSON and Markdown.
