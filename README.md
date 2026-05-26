# HR System tests

This project contains automated tests for the integrated HR System stack.

## Scope

- Service smoke tests: health checks and basic protected endpoint checks.
- Real role E2E flow: Super Admin, Admin, HR and Consultant against running services.
- Performance tests: load and stress tests against real local services.

These tests are intended to run against real services. They should not use mocks or stubs for the final software testing delivery.

## Local execution

Start the stack from the project root:

```bash
docker compose up -d --build
```

Then run:

```bash
cd tests
npm install
npm run test:services
npm run test:e2e:roles
npm run perf
```

## Required URLs

The default Playwright and performance configuration expects:

- Auth: `http://localhost:3001/api/v1`
- Employee: `http://localhost:3002/api`
- Contract: `http://localhost:3003/api`
- Vacation: `http://localhost:3004/api`
- Report: `http://localhost:3005/api`
- History: `http://localhost:3006`
- Super Admin: `http://localhost:3007`
- Mailpit: `http://localhost:8025`

## Production validation

For a deployed environment, point the test environment variables to the public or private deployed URLs and run the same suites. Use conservative performance concurrency first, then increase load once smoke and E2E pass.

Reports are written to `performance/reports` as JSON and Markdown.
