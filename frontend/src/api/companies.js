import { apiClient } from "./client.js";

export async function listCompanies(params = {}) {
  const response = await apiClient.get("/companies", { params });
  return response.data;
}

export async function getCompany(companyId) {
  const response = await apiClient.get(`/companies/${companyId}`);
  return response.data;
}

export async function listCompanyInvestments(companyId, params = {}) {
  const response = await apiClient.get(`/companies/${companyId}/investments`, { params });
  return response.data;
}
