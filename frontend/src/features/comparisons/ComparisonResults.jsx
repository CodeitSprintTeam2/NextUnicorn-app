import { CompanyDataTable } from "../../components/CompanyDataTable.jsx";
import { formatKoreanAmount } from "../../utils/amount.js";
export function ComparisonResults({myCompany,compareCompanies=[],sortBy="actualInvestment",order="desc"}) {
 const rows=[myCompany,...compareCompanies].filter(Boolean).sort((a,b)=>{let result=sortBy==="employees"?Number(a.employees??0)-Number(b.employees??0):BigInt(a[sortBy]??0)-BigInt(b[sortBy]??0);if(typeof result==="bigint")result=result<0n?-1:result>0n?1:0;return result===0?Number(a.id)-Number(b.id):order==="asc"?result:-result;});
 const columns=[{key:"name",label:"기업 명",width:"150px"},{key:"description",label:"기업 소개"},{key:"category",label:"카테고리",width:"90px"},{key:"actualInvestment",label:"누적 투자 금액",render:r=>formatKoreanAmount(r.actualInvestment)},{key:"revenue",label:"매출액",render:r=>formatKoreanAmount(r.revenue)},{key:"employees",label:"고용 인원",render:r=>`${r.employees}명`}];
 return <CompanyDataTable rows={rows} columns={columns} rowHref={c=>`/companies/${c.id}`}/>;
}
