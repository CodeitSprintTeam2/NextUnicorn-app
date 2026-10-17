import * as comparisonsService from "./comparisons.service.js";
import {
  parseCreateComparisonBody,
  parseComparisonStatusQuery,
} from "./comparisons.validation.js";

export async function createComparisonController(request, response, next) {
  try {
    const { myCompanyId, compareCompanyIds } = parseCreateComparisonBody(
      request.body,
    );

    const comparison = await comparisonsService.createComparison(
      myCompanyId,
      compareCompanyIds,
    );

    response.status(200).json({
      data: comparison,
    });
    
  } catch (error) {
    next(error);
  }
}

export async function getComparisonStatusController(request, response, next) {
  try {
    const query = parseComparisonStatusQuery(request.query);
    const result = await comparisonsService.getComparisonStatus(query);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
