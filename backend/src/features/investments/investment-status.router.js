import { Router } from "express";
import { getInvestmentStatus } from "./investment-status.controller.js";

export const investmentStatusRouter = Router();

investmentStatusRouter.get("/", getInvestmentStatus);
