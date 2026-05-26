import {test, expect} from "@playwright/test";
import { createVerifiedUser, deleteUser } from "../utils/verified-user.helper";

test('Should login succesfully with valid credentials', async ({request, baseURL}) =>{
    const user = await createVerifiedUser(request, baseURL!, "ADMIN");
    try {
    const response = await request.post(`${baseURL}/auth/login`,{
        data: {
            email: user.email,
            password: user.password,
        }
    })
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toHaveProperty('accessToken');
    expect(typeof responseBody.data.accessToken).toBe('string');
    } finally {
        await deleteUser(user.email);
    }
});

