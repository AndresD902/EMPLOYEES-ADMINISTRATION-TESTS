import { test, expect} from "@playwright/test";
import { loginAndGetToken } from "../utils/auth.helper";

test('Should reject acces to  /protected/admin-only for a non-admin user', async({request, baseURL})=>{
    const token = await loginAndGetToken(
        baseURL!,
        process.env.HR_EMAIL!,
        process.env.HR_PASSWORD!,
    )

    const response = await request.get(`${baseURL}/protected/admin-only`,{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    expect(response.status()).toBe(403);

    const responseBody = await response.json()
    expect(responseBody.success).toBe(false)
})