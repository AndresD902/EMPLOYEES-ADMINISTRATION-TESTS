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
    expect(responseBody.data).toHaveProperty('token');
    expect(typeof responseBody.data.token).toBe('string');
});