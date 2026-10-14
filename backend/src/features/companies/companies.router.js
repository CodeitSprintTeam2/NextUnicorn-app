import { Router } from "express";
import {
  getCompanies,
  getCompany,
  getCompanyInvestments,
} from "./companies.controller.js";

export const companiesRouter = Router();

companiesRouter.get("/", getCompanies);
companiesRouter.get("/:companyId", getCompany);
companiesRouter.get("/:companyId/investments", getCompanyInvestments);
