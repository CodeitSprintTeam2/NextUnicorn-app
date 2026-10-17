import * as rankingsService from "./rankings.service.js";
import {
  parseCompanyId,
  parseCompanyRankingQuery,
} from "./rankings.validation.js";

export async function getCompanyRankingController(request, response, next) {
  try {
    const companyId = parseCompanyId(request.params.companyId);
    const query = parseCompanyRankingQuery(request.query);
    const data = await rankingsService.getCompanyRanking(companyId, query);

    response.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}
