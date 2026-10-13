import { useEffect,useMemo,useState } from "react";
import { Link } from "react-router-dom";
import { classifyApiError } from "../../api/errors.js";
import { CompanyDataTable } from "../../components/CompanyDataTable.jsx";
import { FeedbackState } from "../../components/FeedbackState.jsx";
import { Pagination } from "../../components/Pagination.jsx";
import { SearchSortBar } from "../../components/SearchSortBar.jsx";
import { formatKoreanAmount } from "../../utils/amount.js";
import { listCompanies } from "./companies.api.js";
import "./CompaniesPage.css";
const SORT_OPTIONS=[{value:"revenue:desc",label:"매출액 높은 순"},{value:"revenue:asc",label:"매출액 낮은 순"},{value:"actualInvestment:desc",label:"누적 투자 금액 높은 순"},{value:"actualInvestment:asc",label:"누적 투자 금액 낮은 순"},{value:"employees:desc",label:"고용 인원 많은 순"},{value:"employees:asc",label:"고용 인원 적은 순"}];
export function CompaniesPage(){const [input,setInput]=useState("");const [search,setSearch]=useState("");const [sort,setSort]=useState("revenue:desc");const [page,setPage]=useState(1);const [refresh,setRefresh]=useState(0);const [result,setResult]=useState({state:"loading",rows:[],meta:null,message:""});const [sortBy,order]=sort.split(":");
 useEffect(()=>{const t=setTimeout(()=>setSearch(input.trim()),250);return()=>clearTimeout(t);},[input]);
 useEffect(()=>{let active=true;setResult(r=>({...r,state:"loading",message:""}));listCompanies({page,limit:10,search:search||undefined,sortBy,order}).then(r=>{if(active)setResult({state:r.data?.length?"ready":"empty",rows:r.data??[],meta:r.meta,message:""});}).catch(e=>{if(active){const f=classifyApiError(e);setResult({state:f.kind==="unavailable"?"unavailable":"error",rows:[],meta:null,message:f.message});}});return()=>{active=false;};},[page,search,sortBy,order,refresh]);
 const columns=useMemo(()=>[{key:"rank",label:"순위",width:"54px",render:(_,i)=>(page-1)*10+i+1},{key:"name",label:"기업 명",width:"150px"},{key:"description",label:"기업 소개",render:r=><span className="company-description">{r.description}</span>},{key:"category",label:"카테고리",width:"90px"},{key:"actualInvestment",label:"누적 투자 금액",width:"120px",render:r=>formatKoreanAmount(r.actualInvestment)},{key:"revenue",label:"매출액",width:"100px",render:r=>formatKoreanAmount(r.revenue)},{key:"employees",label:"고용 인원",width:"88px",render:r=>`${r.employees}명`}],[page]);
 return <section><div className="page-heading"><h1 className="page-title">전체 스타트업 목록</h1><Link className="button button--outline companies-compare" to="/compare">기업 비교하기</Link></div><SearchSortBar search={input} onSearchChange={v=>{setInput(v);setPage(1);}} sortValue={sort} sortOptions={SORT_OPTIONS} onSortChange={v=>{setSort(v);setPage(1);}}/>{result.state==="ready"?<><CompanyDataTable rows={result.rows} columns={columns} rowHref={r=>`/companies/${r.id}`}/><Pagination page={result.meta?.page??page} totalPages={result.meta?.totalPages??0} onChange={setPage}/></>:<FeedbackState state={result.state} message={result.message||undefined} onRetry={result.state==="error"||result.state==="unavailable"?()=>setRefresh(x=>x+1):undefined}/>}</section>;
}
