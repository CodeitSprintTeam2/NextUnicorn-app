import * as comparisonsService from "./comparisons.service.js";

export async function createComparison(req, res, next) {
  try {
    const { myCompanyId, compareCompanyIds } = req.body;
    const result = await comparisonsService.createComparison(myCompanyId, compareCompanyIds);

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}


