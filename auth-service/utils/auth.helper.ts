import { request, APIRequestContext, expect } from "@playwright/test";

export async function loginAndGetToken(
    baseURL: string,
    email: string,
    password: string,
): Promise<string> {
    const apiContext: APIRequestContext = await request.newContext({
        baseURL,
        extraHTTPHeaders: {
            Accept: 'application/json',
            'content-Type': 'application/json'
        }
    })

    const response = await apiContext.post(`${baseURL}/auth/login`,
    {
        data: {
            email,
            password,
        },
    });

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.data).toHaveProperty("accessToken");
    return responseBody.data.accessToken;
}

