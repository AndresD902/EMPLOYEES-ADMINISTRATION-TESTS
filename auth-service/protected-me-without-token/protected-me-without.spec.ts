import { test,expect } from "@playwright/test";

test('Should reject acces to /protected/me without token', async ({request, baseURL})=>{
    const response = await request.get(`${baseURL}/protected/me`);

    expect(response.status()).toBe(401);

    const responseBody = await response.json();

    expect(responseBody.success).toBe(false);
})

