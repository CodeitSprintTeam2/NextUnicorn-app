function requireEnvironmentVariable(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = Object.freeze({
  clientOrigin: requireEnvironmentVariable("CLIENT_ORIGIN"),
  databaseUrl: requireEnvironmentVariable("DATABASE_URL"),
  port: process.env.PORT || "3000",
});
