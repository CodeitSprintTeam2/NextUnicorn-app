import * as comparisonsService from "./comparisons.service.js";

export async function createComparisonController(request, response) {
  const { myCompanyId, compareCompanyIds } = request.body;

  const comparison = await comparisonsService.createComparison(
    myCompanyId,
    compareCompanyIds,
  );

  response.status(200).json({
    data: comparison,
  });
}

export async function getComparisonStatusController(request, response) {
  const page =
    request.query.page !== undefined ? Number(request.query.page) : undefined;
  const limit =
    request.query.limit !== undefined ? Number(request.query.limit) : undefined;
  const { sortBy, order } = request.query;

  const result = await comparisonsService.getComparisonStatus({
    page,
    limit,
    sortBy,
    order,
  });

  response.status(200).json(result);
}
