import { Router } from "express";
import { getCompanyRankingController } from "./rankings.controller.js";

export const rankingsRouter = Router();

rankingsRouter.get("/companies/:companyId", getCompanyRankingController);
