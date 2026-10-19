import { createInvestment, updateInvestment } from "./investments.service.js";
import {
  parseCreateInvestmentBody,
  parseInvestmentId,
  parseUpdateInvestmentBody,
} from "./investments.validation.js";

export async function postInvestment(request, response, next) {
  try {
    const input = parseCreateInvestmentBody(request.body);
    const result = await createInvestment(input);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function patchInvestment(request, response, next) {
  try {
    const investmentId = parseInvestmentId(request.params.investmentId);
    const input = parseUpdateInvestmentBody(request.body);
    const result = await updateInvestment(investmentId, input);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
