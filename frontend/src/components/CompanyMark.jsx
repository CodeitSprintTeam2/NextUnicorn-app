import styles from "./CompanyMark.module.css";

export function CompanyMark({ company, size = "md" }) {
  const name = company?.name ?? "기업";
  const imageUrl = company?.logoUrl ?? company?.imageUrl;

  return (
    <span
      className={`${styles.mark} ${styles[size]}`}
      role="img"
      aria-label={name}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" loading="lazy" />
      ) : (
        <span aria-hidden="true">{name.slice(0, 1)}</span>
      )}
    </span>
  );
}
