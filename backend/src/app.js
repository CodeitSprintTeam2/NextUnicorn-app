
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { comparisonsRouter } from "./features/comparisons/comparisons.routes.js";

export const app = express();

// 실제 배포 주소
const allowedOrigins = [
  "https://nextunicorn-app.netlify.app",
];

// CORS 허용 여부 확인
function isAllowedOrigin(origin) {
  if (!origin) return true;

  // 실제 배포 주소 및 환경 변수에 설정된 주소 허용
  if (allowedOrigins.includes(origin) || origin === env.clientOrigin) {
    return true;
  }

  // Netlify PR 미리보기 주소 허용
  return /^https:\/\/deploy-preview-\d+--nextunicorn-app\.netlify\.app$/.test(
    origin,
  );
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  }),
);

app.use(express.json());


app.use("/api", comparisonsRouter);

app.get("/api/health", (request, response) => {
  response.status(200).json({
    data: {
      status: "ok",
    },
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  response.status(error.status || 500).json({
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "서버 오류가 발생했습니다.",
    },
  });
});