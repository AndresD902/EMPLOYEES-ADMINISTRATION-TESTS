import {test, expect} from "@playwright/test";
import { loginAndGetToken } from "../utils/auth.helper";

test('Should allow acces to /protected/me with a valid token', async({request, baseURL})=>{
    const token = await loginAndGetToken(
        baseURL!,
        process.env.ADMIN_EMAIL!,
        process.env.ADMIN_PASSWORD!,
    );

    const response = await request.get(`${baseURL}/protected/me`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    });

    expect (response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toHaveProperty('email');
    expect(responseBody.data).toHaveProperty('role');
});