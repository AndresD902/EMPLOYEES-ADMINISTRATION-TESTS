import { defineConfig } from "@playwright/test";
import { existsSync, readFileSync } from "fs";
import path from "path";

const envPath = path.resolve(__dirname, ".env");

if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, "utf8");

    for (const line of envFile.split(/\r?\n/)) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmedLine.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1).trim();

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

export default defineConfig({
    testDir: '.',
    timeout: 30000,
    reporter: [['html', { open: 'never' }]],
    use: {
        baseURL: process.env.AUTH_SERVICE_BASE_URL,
        extraHTTPHeaders: {
            Accept: 'application/json',
            'content-Type': 'application/json'
        },
    },
});
