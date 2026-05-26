import { test, expect } from "@playwright/test";

const superAdminServiceUrl = process.env.SUPERADMIN_SERVICE_BASE_URL ?? "http://localhost:3007";

test("Should return super-admin-service health status successfully", async ({ request }) => {
  const response = await request.get(`${superAdminServiceUrl}/api/health`);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.status).toBe("ok");
  expect(responseBody.service).toBe("super-admin-service");
});
