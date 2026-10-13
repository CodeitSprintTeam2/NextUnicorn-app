import "./CompanyMark.css";
export function CompanyMark({company,size="md"}) {const name=company?.name??"기업";const url=company?.logoUrl??company?.imageUrl;return <span className={`company-mark company-mark--${size}`} role="img" aria-label={name}>{url?<img src={url} alt="" loading="lazy"/>:<span aria-hidden="true">{name.slice(0,1)}</span>}</span>;}
