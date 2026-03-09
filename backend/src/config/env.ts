import "dotenv/config";

// Define each key once
const ENV_KEYS = [
  "PORT",
  "MODE",
  "NODE_ENV",
  "SERVER_URL",
  "CLIENT_URL",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "DATABASE_URL",
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];

// Function to get env value
function getEnv(key: EnvKey): string {
  const envKey = Object.keys(process.env).find(
    (k) => k.toLowerCase() === `env${key.toLowerCase()}`
  );
  if (envKey && process.env[envKey]) return process.env[envKey]!;

  if (process.env[key]) return process.env[key]!;

  throw new Error(`Missing required environment variable: ${key}`);
}

export const secret: Record<EnvKey, string> = Object.fromEntries(
  ENV_KEYS.map((key) => [key, getEnv(key)])
) as Record<EnvKey, string>;