import { test, expect } from "@playwright/test";

const reportServiceUrl = process.env.REPORT_SERVICE_BASE_URL ?? "http://localhost:3005";

test("Should return report-service health status successfully", async ({ request }) => {
  const response = await request.get(`${reportServiceUrl}/api/health`);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.status).toBe("ok");
  expect(responseBody.service).toBe("report-service");
});
