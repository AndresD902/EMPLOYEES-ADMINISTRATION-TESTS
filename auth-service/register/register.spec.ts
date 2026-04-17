import { test, expect } from "@playwright/test";

test('Should register a new user succesfully', async({request, baseURL})=>{
    const uniqueEmail = `user${Date.now()}@example.com`;

    const response = await request.post(`${baseURL}/auth/register`, {
        data: {
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            password: 'Test123*',
            role: 'CONSULTATION',
        },
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json()
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toHaveProperty('email');
    expect(responseBody.data.email).toBe(uniqueEmail);
})