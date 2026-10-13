import { apiClient } from "../../api/client.js";
export async function submitComparison(payload) { return (await apiClient.post("/comparisons",payload)).data; }
export async function getCompanyRanking(companyId,params) { return (await apiClient.get(`/rankings/companies/${companyId}`,{params})).data; }
export async function getComparisonStatus(params={}) { return (await apiClient.get("/comparison-status",{params})).data; }
export function canSubmitComparison(myCompanyId,companies) { return Boolean(myCompanyId&&companies?.length>=1&&companies.length<=5&&new Set(companies.map(c=>String(c.id))).size===companies.length&&!companies.some(c=>String(c.id)===String(myCompanyId))); }
export function toggleCompanySelection(current,company) { const index=current.findIndex(item=>String(item.id)===String(company.id));if(index>=0)return current.filter((_,i)=>i!==index);if(current.length>=5)return current;return [...current,company]; }
