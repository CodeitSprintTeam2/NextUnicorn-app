import "./CompanyMark.css";

export function CompanyMark({ company, size = "md" }) {
  const label = company?.name ?? "기업";
  const imageUrl = company?.logoUrl ?? company?.imageUrl;

  return (
    <span className={`company-mark company-mark--${size}`} role="img" aria-label={label}>
      {imageUrl ? (
        <img src={imageUrl} alt="" loading="lazy" />
      ) : (
        <span aria-hidden="true">{label.slice(0, 1)}</span>
      )}
    </span>
  );
}
