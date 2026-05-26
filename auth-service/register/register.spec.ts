import { test, expect } from "@playwright/test";

import { deleteUser } from "../utils/verified-user.helper";

test('Should register a new user succesfully', async({request, baseURL})=>{
    const uniqueEmail = `qa.register.${Date.now()}@gmail.com`;

    try {
    const response = await request.post(`${baseURL}/auth/register`, {
        data: {
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            password: 'Test123*',
            role: 'HR',
            companyId: Date.now(),
        },
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json()
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toHaveProperty('email');
    expect(responseBody.data.email).toBe(uniqueEmail);
    } finally {
        await deleteUser(uniqueEmail);
    }
})
