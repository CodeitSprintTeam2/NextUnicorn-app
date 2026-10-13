import { Link } from "react-router-dom";
import { CompanyMark } from "./CompanyMark.jsx";
import "./CompanyDataTable.css";
function content(row,col,index,rowHref){if(col.render)return col.render(row,index);if(col.key==="name"&&rowHref)return <Link className="data-table__company" to={rowHref(row)}><CompanyMark company={row} size="sm"/><span>{row.name}</span></Link>;return row[col.key]??"-";}
export function CompanyDataTable({rows=[],columns=[],rowHref,getKey=row=>row.id}) {
  if(!rows.length)return null;
  return <div className="company-data-table"><div className="company-data-table__desktop"><div className="company-data-table__scroll"><table className="data-table"><thead><tr>{columns.map(col=><th key={col.key} scope="col" style={col.width?{width:col.width}:undefined}>{col.label}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={getKey(row)}>{columns.map(col=><td key={col.key}>{content(row,col,index,rowHref)}</td>)}</tr>)}</tbody></table></div></div><div className="company-data-table__mobile">{rows.map((row,index)=><article className="data-table-card" key={getKey(row)}><div className="data-table-card__identity">{row.name&&<CompanyMark company={row} size="md"/>}<div>{rowHref&&row.name?<Link to={rowHref(row)}>{row.name}</Link>:<strong>{row.name??"기업 정보"}</strong>}{row.description&&<p>{row.description}</p>}</div></div><dl className="data-table-card__fields">{columns.filter(c=>c.key!=="name"&&c.key!=="description").map(col=><div key={col.key}><dt>{col.label}</dt><dd>{content(row,col,index,rowHref)}</dd></div>)}</dl></article>)}</div></div>;
}
