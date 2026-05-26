import { test, expect } from "@playwright/test";

const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_BASE_URL ?? "http://localhost:3002";

test("Should reject employee list access without token", async ({ request }) => {
  const response = await request.get(`${employeeServiceUrl}/api/empleados`);

  expect(response.status()).toBe(401);

  const responseBody = await response.json();
  expect(responseBody.error).toBe("Token requerido");
});
