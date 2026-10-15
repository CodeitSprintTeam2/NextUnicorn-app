import { Router } from "express";
import {
  createComparisonController,
  getComparisonStatusController,
} from "./comparisons.controller.js";

export const comparisonsRouter = Router();

comparisonsRouter.post("/comparisons", createComparisonController);
comparisonsRouter.get("/comparison-status", getComparisonStatusController);
