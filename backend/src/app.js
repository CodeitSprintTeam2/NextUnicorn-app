import cors from "cors";
import express from "express";
import { env } from "./config/env.js";

export const app = express();

// CORS 허용 주소
const allowedOrigins = [
  env.clientOrigin,
  "https://deploy-preview-19--viewmystartup2.netlify.app",
];

// CORS 설정
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  }),
);

// JSON 요청 처리
app.use(express.json());

// 서버 상태 확인 API
app.get("/api/health", (request, response) => {
  response.status(200).json({
    data: {
      status: "ok",
    },
  });
});

// 공통 에러 처리
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 오류가 발생했습니다.",
    },
  });
});
