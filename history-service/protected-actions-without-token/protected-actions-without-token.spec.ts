import { test, expect } from "@playwright/test";

const historyServiceUrl = process.env.HISTORY_SERVICE_BASE_URL ?? "http://localhost:3006";

test("Should reject history actions access without token", async ({ request }) => {
  const response = await request.get(`${historyServiceUrl}/api/historial/acciones`);

  expect(response.status()).toBe(401);
});
