import { apiClient } from "../../api/client.js";

const COMPANIES_ENDPOINT = "/companies";

export async function listCompanies(params = {}) {
  const response = await apiClient.get(COMPANIES_ENDPOINT, { params });
  return response.data;
}

export async function getCompany(companyId) {
  const response = await apiClient.get(`${COMPANIES_ENDPOINT}/${companyId}`);
  return response.data;
}

export async function listCompanyInvestments(companyId, params = {}) {
  const response = await apiClient.get(
    `${COMPANIES_ENDPOINT}/${companyId}/investments`,
    { params },
  );
  return response.data;
}
