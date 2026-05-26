import { test, expect } from "@playwright/test";

const historyServiceUrl = process.env.HISTORY_SERVICE_BASE_URL ?? "http://localhost:3006";

test("Should return history-service health status successfully", async ({ request }) => {
  const response = await request.get(`${historyServiceUrl}/health`);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.status).toBe("ok");
  expect(responseBody.service).toBe("history-service");
});
