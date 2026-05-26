import { test, expect } from "@playwright/test";

const vacationServiceUrl = process.env.VACATION_SERVICE_BASE_URL ?? "http://localhost:3004";

test("Should return vacation-service health status successfully", async ({ request }) => {
  const response = await request.get(`${vacationServiceUrl}/api/health`);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.status).toBe("ok");
  expect(responseBody.service).toBe("vacation-service");
});
