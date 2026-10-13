import { useState } from "react";
import { classifyApiError } from "../../api/errors.js";
import { CompanyMark } from "../../components/CompanyMark.jsx";
import { Modal } from "../../components/Modal.jsx";
import { createInvestment,deleteInvestment,updateInvestment } from "./investments.api.js";
import { InvestmentForm } from "./InvestmentForm.jsx";
import { formatKoreanAmount } from "../../utils/amount.js";
import "./InvestmentDialogs.css";
export function InvestmentDialogs({company,mode,investment,onClose,onChanged}){const [pending,setPending]=useState(false);const [error,setError]=useState("");const [password,setPassword]=useState("");if(!mode)return null;
 async function save(values){setPending(true);setError("");try{if(mode==="create")await createInvestment({companyId:Number(company.id),investorName:values.investorName,amount:values.amount,comment:values.comment,password:values.password,passwordConfirm:values.passwordConfirm});else await updateInvestment(investment.id,{investorName:values.investorName,amount:values.amount,comment:values.comment,password:values.password});onChanged?.();onClose?.();}catch(e){setError(classifyApiError(e).message);}finally{setPending(false);}}
 async function remove(){if(password.length<4||password.length>20){setError("비밀번호는 4자 이상 20자 이하로 입력해 주세요.");return;}setPending(true);setError("");try{await deleteInvestment(investment.id,password);onChanged?.();onClose?.();}catch(e){setError(classifyApiError(e).message);}finally{setPending(false);}}
 if(mode==="delete")return <Modal open title="투자 내역 삭제" onClose={onClose}><p className="delete-summary">{investment?.investorName} · {formatKoreanAmount(investment?.amount)}</p><label className="investment-field"><span>비밀번호</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="form-error" role="alert">{error}</p>}<div className="investment-form__actions"><button className="button button--outline" onClick={onClose}>취소</button><button className="button" disabled={pending} onClick={remove}>삭제하기</button></div></Modal>;
 return <Modal open title={mode==="create"?"기업에 투자하기":"투자 내역 수정"} onClose={onClose} className="modal--investment">{mode==="create"&&<div className="investment-company"><CompanyMark company={company} size="sm"/><strong>{company?.name}</strong><small>{company?.category}</small></div>}<InvestmentForm key={`${mode}-${investment?.id??"new"}`} mode={mode} investment={investment} pending={pending} serverError={error} onSubmit={save} onCancel={onClose}/></Modal>;
}
