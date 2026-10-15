import { Router } from "express";
import { postInvestment } from "./investments.controller.js";

export const investmentsRouter = Router();

investmentsRouter.post("/", postInvestment);
