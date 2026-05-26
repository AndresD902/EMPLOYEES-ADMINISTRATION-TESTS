import { test, expect } from "@playwright/test";

const reportServiceUrl = process.env.REPORT_SERVICE_BASE_URL ?? "http://localhost:3005";

test("Should reject report access without token", async ({ request }) => {
  const response = await request.get(`${reportServiceUrl}/api/reportes/estado-laboral`);

  expect(response.status()).toBe(401);
});
