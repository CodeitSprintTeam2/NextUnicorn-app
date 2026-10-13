
'use strict';
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function chooseComparison(ids,id,own){if(ids.includes(id))return{ok:true,ids:ids.filter(x=>x!==id)};if(id===own)return{ok:false,message:'나의 기업은 비교 기업으로 선택할 수 없습니다.'};if(ids.length>=5)return{ok:false,message:'비교 기업은 최대 5개까지 선택 가능합니다.'};return{ok:true,ids:[...ids,id]};}
function validateInvestment(v){if(!v.name.trim())return'투자자 이름을 입력해 주세요.';const n=Number(v.amount);if(!/^\d+(\.\d{1,4})?$/.test(v.amount)||!Number.isFinite(n)||n<=0||n>100000000)return'투자 금액은 0보다 큰 숫자로, 소수점 4자리까지 입력해 주세요.';if(!v.comment.trim())return'투자 코멘트를 입력해 주세요.';if(v.password.length<4)return'비밀번호를 4자 이상 입력해 주세요.';if(v.password!==v.confirm)return'비밀번호가 일치하지 않습니다.';return'';}
function investmentTotal(items){return Math.round(items.reduce((n,x)=>n+Math.round(x.amount*10000),0))/10000;}

function parseKoreanWon(value){
  const text=String(value??'').replace(/,/g,'').replace(/\s/g,'');
  const m=text.match(/^(?:(\d+(?:\.\d+)?)억)?(?:(\d+(?:\.\d+)?)만)?(?:(\d+(?:\.\d+)?))?원$/);
  if(!m||(!m[1]&&!m[2]&&!m[3]))return null;
  const result=Number(m[1]||0)*100000000+Number(m[2]||0)*10000+Number(m[3]||0);
  return Number.isSafeInteger(result)?result:null;
}
function recordKind(record){
  const stage=String(record.stage||'').replace(/\s/g,'').toUpperCase();
  if(['지원금','지원','GRANT'].includes(stage))return'grant';
  if(['인수합병','인수','M&A'].includes(stage))return'acquisition';
  return'funding';
}
function companyId(name){
  let hash=2166136261;
  for(const ch of name){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619);}
  return hash>>>0;
}
function buildCompanyCatalog(records){
  const grouped=new Map(),ids=new Map();
  for(const r of records){
    let c=grouped.get(r.name);
    if(!c){
      const id=companyId(r.name);
      if(ids.has(id)&&ids.get(id)!==r.name)throw Error('기업 식별자가 중복됩니다.');
      ids.set(id,r.name);
      c={id,name:r.name,asset:null,category:'',intro:'',funding:null,revenue:null,employees:null,ownCount:0,compareCount:0,recordCount:0,fundingEvents:0,unknownFunding:0,knownFunding:0,grantCount:0,acquisitionCount:0,latestDate:'',latestStage:''};
      grouped.set(r.name,c);
    }
    c.recordCount++;
    if(r.date>c.latestDate){c.latestDate=r.date;c.latestStage=r.stage;c.category=r.stage||'단계 미공개';c.intro=r.description;}
    const kind=recordKind(r),won=parseKoreanWon(r.amountRaw);
    if(kind==='grant')c.grantCount++;
    else if(kind==='acquisition')c.acquisitionCount++;
    else{c.fundingEvents++;if(won===null)c.unknownFunding++;else{c.knownFunding++;c.funding=(c.funding??0)+won/100000000;}}
  }
  return [...grouped.values()].sort((a,b)=>a.name.localeCompare(b.name,'ko'));
}
function filterInvestmentRecords(records,{year='all',kind='all',query=''}={}){
  const q=String(query).trim().toLocaleLowerCase('ko');
  return records.filter(r=>(year==='all'||r.date.startsWith(String(year)+'-'))&&(kind==='all'||recordKind(r)===kind)&&(!q||[r.name,r.description,r.stage,r.investors].some(v=>String(v||'').toLocaleLowerCase('ko').includes(q))));
}
function recordsToCSV(records){
  const cell=v=>{let text=String(v??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return'"'+text.replace(/"/g,'""')+'"';};
  const rows=[['일자','기업명','분야','투자금','단계','투자사'],...records.map(r=>[r.date,r.name,r.description,r.amountRaw,r.stage,r.investors])];
  return'\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
function sortCompanies(items,order){
  const [key,direction]=order.split('-'),factor=direction==='asc'?1:-1;
  return [...items].sort((a,b)=>{
    const av=a[key],bv=b[key];
    if(av===null||av===undefined)return bv===null||bv===undefined?a.id-b.id:1;
    if(bv===null||bv===undefined)return-1;
    const diff=typeof av==='string'?av.localeCompare(bv):av-bv;
    return diff*factor||a.id-b.id;
  });
}
