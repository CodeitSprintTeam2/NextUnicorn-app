import { Router } from "express";
import { createComparison} from "./comparisons.controller.js";

export const comparisonsRouter = Router();

comparisonsRouter.post("/comparisons", createComparison);


