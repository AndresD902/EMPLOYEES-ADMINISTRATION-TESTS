import { test, expect } from "@playwright/test";

const contractServiceUrl = process.env.CONTRACT_SERVICE_BASE_URL ?? "http://localhost:3003";

test("Should return contract-service health status successfully", async ({ request }) => {
  const response = await request.get(`${contractServiceUrl}/health`);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.success).toBe(true);
  expect(responseBody.service).toBe("contract-service");
});
