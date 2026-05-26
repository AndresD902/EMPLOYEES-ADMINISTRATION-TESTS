import fs from "fs";
import path from "path";
import { APIRequestContext, expect } from "@playwright/test";

const DEFAULT_PASSWORD = "Test123*";

type AuthRole = "ADMIN" | "HR" | "CONSULTATION";

interface TestUser {
  email: string;
  password: string;
  role: AuthRole;
}

export async function createVerifiedUser(
  request: APIRequestContext,
  baseURL: string,
  role: AuthRole,
): Promise<TestUser> {
  const email = `qa.${role.toLowerCase()}.${Date.now()}.${Math.random().toString(16).slice(2)}@gmail.com`;
  const payload = {
    firstName: "QA",
    lastName: role,
    email,
    password: DEFAULT_PASSWORD,
    role,
    ...(role === "HR" ? { companyId: Date.now() } : {}),
  };

  const response = await request.post(`${baseURL}/auth/register`, { data: payload });
  expect(response.status()).toBe(201);

  await setEmailVerified(email, true);

  return { email, password: DEFAULT_PASSWORD, role };
}

export async function deleteUser(email: string): Promise<void> {
  const pool = createPool();
  try {
    await pool.query("DELETE FROM users WHERE email = $1", [email.toLowerCase()]);
  } finally {
    await pool.end();
  }
}

async function setEmailVerified(email: string, verified: boolean): Promise<void> {
  const pool = createPool();
  try {
    await pool.query(
      "UPDATE users SET email_verified = $1, is_active = TRUE, updated_at = NOW() WHERE email = $2",
      [verified, email.toLowerCase()],
    );
  } finally {
    await pool.end();
  }
}

function createPool() {
  const pgPath = path.resolve(__dirname, "../../../backend/auth-service/node_modules/pg");
  const { Pool } = require(pgPath);
  return new Pool({ connectionString: getDatabaseUrl() });
}

function getDatabaseUrl(): string {
  if (process.env.AUTH_DATABASE_URL) return process.env.AUTH_DATABASE_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envPath = path.resolve(__dirname, "../../../backend/auth-service/.env");
  const envFile = fs.readFileSync(envPath, "utf8");
  const line = envFile.split(/\r?\n/).find((entry) => entry.trim().startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL not found for auth-service");
  return line.slice(line.indexOf("=") + 1).trim();
}
