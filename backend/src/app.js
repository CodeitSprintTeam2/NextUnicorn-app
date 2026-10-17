
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { comparisonsRouter } from "./features/comparisons/comparisons.routes.js";
import { companiesRouter } from "./features/companies/companies.router.js";
import { investmentStatusRouter } from "./features/investments/index.js";
import { investmentsRouter } from "./features/investments/investments.router.js";
import { rankingsRouter } from "./features/rankings/rankings.router.js";
import { errorHandler } from "./middleware/error-handler.js";

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



app.get("/api/health", (request, response) => {
  response.status(200).json({
    data: {
      status: "ok",
    },
  });
});
app.use("/api", comparisonsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/investment-status", investmentStatusRouter);
app.use("/api/investments", investmentsRouter);
app.use("/api/rankings", rankingsRouter);
app.use(errorHandler);
