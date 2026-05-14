import {test, expect} from "@playwright/test";

test('Should login succesfully with valid credentials', async ({request, baseURL}) =>{
    const response = await request.post(`${baseURL}/auth/login`,{
        data: {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
        }
    })
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    expect(responseBody.success).toBe(true);

    // El token puede venir como 'token' o 'accessToken' según la implementación
    const token = responseBody.data.token || responseBody.data.accessToken;
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
});