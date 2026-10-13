import "./Pagination.css";
export function Pagination({page=1,totalPages=0,onChange}) {
  if(totalPages<=1)return null;const start=Math.floor((page-1)/5)*5+1;const end=Math.min(start+4,totalPages);const items=Array.from({length:end-start+1},(_,i)=>start+i);
  return <nav className="pagination" aria-label="페이지 이동"><button type="button" aria-label="이전 페이지" disabled={page<=1} onClick={()=>onChange(page-1)}>‹</button>{items.map(n=><button type="button" key={n} aria-current={n===page?"page":undefined} className={n===page?"is-active":""} onClick={()=>onChange(n)}>{n}</button>)}<button type="button" aria-label="다음 페이지" disabled={page>=totalPages} onClick={()=>onChange(page+1)}>›</button></nav>;
}
