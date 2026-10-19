import { Router } from "express";
import {
  deleteInvestmentById,
  patchInvestment,
  postInvestment,
} from "./investments.controller.js";

export const investmentsRouter = Router();

investmentsRouter.post("/", postInvestment);
investmentsRouter.patch("/:investmentId", patchInvestment);
investmentsRouter.delete("/:investmentId", deleteInvestmentById);
