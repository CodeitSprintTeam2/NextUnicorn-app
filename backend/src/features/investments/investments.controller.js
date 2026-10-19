import {
  createInvestment,
  deleteInvestment,
  updateInvestment,
} from "./investments.service.js";
import {
  parseCreateInvestmentBody,
  parseDeleteInvestmentBody,
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

export async function deleteInvestmentById(request, response, next) {
  try {
    const investmentId = parseInvestmentId(request.params.investmentId);
    const { password } = parseDeleteInvestmentBody(request.body);
    await deleteInvestment(investmentId, password);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
