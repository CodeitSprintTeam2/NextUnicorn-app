import { apiClient } from "../../api/client.js";
export async function getInvestmentStatus(params={}) { return (await apiClient.get("/investment-status",{params})).data; }
export async function createInvestment(payload) { return (await apiClient.post("/investments",payload)).data; }
export async function updateInvestment(investmentId,payload) { return (await apiClient.patch(`/investments/${investmentId}`,payload)).data; }
export async function deleteInvestment(investmentId,password) { return apiClient.delete(`/investments/${investmentId}`,{data:{password}}); }
export function validateInvestment(values,{mode="create"}={}) {
  const errors={}; const name=values.investorName?.trim()??"";const comment=values.comment?.trim()??"";const password=values.password??"";let amount;
  try { amount=BigInt(values.amount); } catch { amount=0n; }
  if(name.length<1||name.length>20)errors.investorName="투자자 이름은 1자 이상 20자 이하로 입력해 주세요.";
  if(!/^\d+$/.test(values.amount??"")||amount<1n||amount>9223372036854775807n)errors.amount="투자 금액은 1 이상 9223372036854775807 이하의 정수로 입력해 주세요.";
  if(comment.length<1||comment.length>200)errors.comment="투자 코멘트는 1자 이상 200자 이하로 입력해 주세요.";
  if(password.length<4||password.length>20)errors.password="비밀번호는 4자 이상 20자 이하로 입력해 주세요.";
  if(mode==="create"&&password!==(values.passwordConfirm??""))errors.passwordConfirm="비밀번호가 일치하지 않습니다.";
  return errors;
}
