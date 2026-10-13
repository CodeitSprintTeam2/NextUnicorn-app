import { apiClient } from "../../api/client.js";
export async function listCompanies(params={}) { return (await apiClient.get("/companies",{params})).data; }
export async function getCompany(companyId) { return (await apiClient.get(`/companies/${companyId}`)).data; }
export async function listCompanyInvestments(companyId,params={}) { return (await apiClient.get(`/companies/${companyId}/investments`,{params})).data; }
