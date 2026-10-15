import { parseInvestmentStatusQuery } from "./investment-status.query.js";
import { listInvestmentStatus } from "./investment-status.service.js";

export async function getInvestmentStatus(request, response, next) {
  try {
    const query = parseInvestmentStatusQuery(request.query);
    const result = await listInvestmentStatus(query);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
