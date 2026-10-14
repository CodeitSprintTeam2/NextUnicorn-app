import {
  parseCompaniesQuery,
  parseCompanyId,
  parseCompanyInvestmentsQuery,
} from "./companies.query.js";
import {
  getCompanyDetail,
  listCompanies,
  listCompanyInvestments,
} from "./companies.service.js";

export async function getCompanies(request, response, next) {
  try {
    const query = parseCompaniesQuery(request.query);
    const result = await listCompanies(query);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCompany(request, response, next) {
  try {
    const companyId = parseCompanyId(request.params.companyId);
    const result = await getCompanyDetail(companyId);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyInvestments(request, response, next) {
  try {
    const companyId = parseCompanyId(request.params.companyId);
    const query = parseCompanyInvestmentsQuery(request.query);
    const result = await listCompanyInvestments({ companyId, ...query });
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
