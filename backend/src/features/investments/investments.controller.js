import { createInvestment } from "./investments.service.js";
import { parseCreateInvestmentBody } from "./investments.validation.js";

export async function postInvestment(request, response, next) {
  try {
    const input = parseCreateInvestmentBody(request.body);
    const result = await createInvestment(input);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
