import {test, expect} from "@playwright/test";
import { loginAndGetToken } from "../utils/auth.helper";
import { createVerifiedUser, deleteUser } from "../utils/verified-user.helper";

test('Should allow acces to /protected/me with a valid token', async({request, baseURL})=>{
    const user = await createVerifiedUser(request, baseURL!, "ADMIN");
    try {
    const token = await loginAndGetToken(
        baseURL!,
        user.email,
        user.password,
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
    } finally {
        await deleteUser(user.email);
    }
});
