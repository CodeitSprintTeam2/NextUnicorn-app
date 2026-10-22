
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

// 벤치마크 환경에서만 쿼리 로깅 활성화
const enableQueryLog = process.env.BENCHMARK_QUERY_LOG === "true";

export const prisma = new PrismaClient({
  adapter,
  log: enableQueryLog
    ? [{ emit: "event", level: "query" }]
    : [],
});

if (enableQueryLog) {
  prisma.$on("query", (event) => {
    const query = event.query.replace(/\s+/g, " ").trim();

    console.log(
      `[Prisma Query] ${event.duration}ms | ${query}`
    );
  });
}

