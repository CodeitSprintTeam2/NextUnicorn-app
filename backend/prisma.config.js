import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
