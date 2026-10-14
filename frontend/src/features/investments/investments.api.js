import { apiClient } from "../../api/client.js";

const INVESTMENTS_ENDPOINT = "/investments";

export async function getInvestmentStatus(params = {}) {
  const response = await apiClient.get("/investment-status", { params });
  return response.data;
}

export async function createInvestment(payload) {
  const response = await apiClient.post(INVESTMENTS_ENDPOINT, payload);
  return response.data;
}

export async function updateInvestment(investmentId, payload) {
  const response = await apiClient.patch(
    `${INVESTMENTS_ENDPOINT}/${investmentId}`, payload,
  );
  return response.data;
}

export async function deleteInvestment(investmentId, password) {
  return apiClient.delete(`${INVESTMENTS_ENDPOINT}/${investmentId}`, {
    data: { password },
  });
}
