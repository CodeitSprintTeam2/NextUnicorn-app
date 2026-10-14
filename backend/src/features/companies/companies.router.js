import { Router } from "express";
import { getCompanies } from "./companies.controller.js";

export const companiesRouter = Router();

companiesRouter.get("/", getCompanies);
