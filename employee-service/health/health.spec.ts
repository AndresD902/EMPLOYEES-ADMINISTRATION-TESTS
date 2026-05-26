import { test, expect } from "@playwright/test";

const employeeServiceUrl = process.env.EMPLOYEE_SERVICE_BASE_URL ?? "http://localhost:3002";

test("Should return employee-service health status successfully", async ({ request }) => {
  const response = await request.get(`${employeeServiceUrl}/health`);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.success).toBe(true);
  expect(responseBody.data.service).toBe("employee-service");
});
