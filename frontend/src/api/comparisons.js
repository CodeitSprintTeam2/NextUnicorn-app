import { apiClient } from "./client.js";

export async function submitComparison(payload) {
  const response = await apiClient.post("/comparisons", payload);
  return response.data;
}

export async function getCompanyRanking(companyId, params) {
  const response = await apiClient.get(`/rankings/companies/${companyId}`, { params });
  return response.data;
}

export async function getComparisonStatus(params = {}) {
  const response = await apiClient.get("/comparison-status", { params });
  return response.data;
}
