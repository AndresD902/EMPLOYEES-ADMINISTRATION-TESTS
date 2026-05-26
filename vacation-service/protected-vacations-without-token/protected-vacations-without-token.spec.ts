import { test, expect } from "@playwright/test";

const vacationServiceUrl = process.env.VACATION_SERVICE_BASE_URL ?? "http://localhost:3004";

test("Should reject vacation list access without token", async ({ request }) => {
  const response = await request.get(`${vacationServiceUrl}/api/vacaciones`);

  expect(response.status()).toBe(401);
});
