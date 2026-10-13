
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";

export const app = express();

const allowedOrigins = [env.clientOrigin];

function isAllowedOrigin(origin) {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
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

app.get("/api/health", (request, response) => {
  response.status(200).json({
    data: {
      status: "ok",
    },
  });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 오류가 발생했습니다.",
    },
  });
});
