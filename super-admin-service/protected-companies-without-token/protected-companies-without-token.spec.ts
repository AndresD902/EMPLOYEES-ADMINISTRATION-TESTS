import { test, expect } from "@playwright/test";

const superAdminServiceUrl = process.env.SUPERADMIN_SERVICE_BASE_URL ?? "http://localhost:3007";

test("Should reject company list access without token", async ({ request }) => {
  const response = await request.get(`${superAdminServiceUrl}/api/super-admin/empresas`);

  expect(response.status()).toBe(401);
});
