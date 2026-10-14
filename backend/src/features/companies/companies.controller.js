import { parseCompaniesQuery } from "./companies.query.js";
import { listCompanies } from "./companies.service.js";

export async function getCompanies(request, response, next) {
  try {
    const query = parseCompaniesQuery(request.query);
    const result = await listCompanies(query);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
