import { test, expect} from "@playwright/test";
import { loginAndGetToken } from "../utils/auth.helper";
import { createVerifiedUser, deleteUser } from "../utils/verified-user.helper";

test('Should reject acces to  /protected/admin-only for a non-admin user', async({request, baseURL})=>{
    const user = await createVerifiedUser(request, baseURL!, "HR");
    try {
    const token = await loginAndGetToken(
        baseURL!,
        user.email,
        user.password,
    )

    const response = await request.get(`${baseURL}/protected/admin-only`,{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    expect(response.status()).toBe(403);

    const responseBody = await response.json()
    expect(responseBody.success).toBe(false)
    } finally {
        await deleteUser(user.email);
    }
})
