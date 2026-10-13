import { apiClient } from "./client.js";

export async function getInvestmentStatus(params = {}) {
  const response = await apiClient.get("/investment-status", { params });
  return response.data;
}

export async function createInvestment(payload) {
  const response = await apiClient.post("/investments", payload);
  return response.data;
}

export async function updateInvestment(investmentId, payload) {
  const response = await apiClient.patch(`/investments/${investmentId}`, payload);
  return response.data;
}

export async function deleteInvestment(investmentId, password) {
  const response = await apiClient.delete(`/investments/${investmentId}`, {
    data: { password },
  });
  return response;
}
