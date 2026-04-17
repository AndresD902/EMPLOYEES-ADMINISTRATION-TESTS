import { test, expect } from "@playwright/test";

test('Should return health status succesfully', async({request, baseURL}) => {
    const response = await request.get(`${baseURL}/health`);

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
});

