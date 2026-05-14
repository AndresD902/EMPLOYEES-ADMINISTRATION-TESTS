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

    // Log para debugging
    console.log(`[loginAndGetToken] Email: ${email}, Status: ${response.status()}`);

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();

    // Soportar ambos nombres de propiedad (accessToken y token)
    const token = responseBody.data.accessToken || responseBody.data.token;

    if (!token) {
        throw new Error(`No se encontró token en la respuesta. Respuesta: ${JSON.stringify(responseBody)}`);
    }

    return token;
}

