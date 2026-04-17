import {test, expect} from "@playwright/test";

test('should reject login with invalid credentials', async({request, baseURL})=>{
    const response = await request.post(`${baseURL}/auth/login`,{
        data: {
            email: process.env.ADMIN_EMAIL,
            password: 'WrongPassword',
        },
    })

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody.success).toBe(false);
});

