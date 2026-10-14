import { NavLink } from "react-router-dom";
import { ROUTES } from "../utils/routes.js";
import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { to: ROUTES.companies, label: "전체 스타트업", end: true },
  { to: ROUTES.compare, label: "나의 기업 비교", end: true },
  { to: ROUTES.comparisonStatus, label: "비교 현황" },
  { to: ROUTES.investments, label: "투자 현황" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink
          className={styles.logo}
          to={ROUTES.companies}
          aria-label="View My Startup 홈"
        >
          <span>view my</span>
          <strong>startup</strong>
        </NavLink>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (
                [styles.link, isActive && styles.active].filter(Boolean).join(" ")
              )}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
