import { test, expect } from "@playwright/test";

const contractServiceUrl = process.env.CONTRACT_SERVICE_BASE_URL ?? "http://localhost:3003";

test("Should reject contract list access without token", async ({ request }) => {
  const response = await request.get(`${contractServiceUrl}/api/contratos`);

  expect(response.status()).toBe(401);

  const responseBody = await response.json();
  expect(responseBody.success).toBe(false);
});
