import { CompanyMark } from "../../../components/CompanyMark.jsx";
import { formatKoreanAmount } from "../../../utils/amount.js";
import styles from "../CompanyDetailPage.module.css";

export function CompanyProfile({ company }) {
  const metrics = [
    { label: "누적 투자 금액", value: formatKoreanAmount(company.actualInvestment) },
    { label: "매출액", value: formatKoreanAmount(company.revenue) },
    { label: "고용 인원", value: `${company.employees}명` },
  ];

  return (
    <>
      <header className={styles.profile}>
        <CompanyMark company={company} size="lg" />
        <div>
          <h1>{company.name}</h1>
          <p>{company.category}</p>
        </div>
      </header>
      <div className={styles.metrics}>
        {metrics.map(({ label, value }) => (
          <div className={styles.metric} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className={styles.about}>
        <h2>기업 소개</h2>
        <p>{company.description}</p>
      </section>
    </>
  );
}
