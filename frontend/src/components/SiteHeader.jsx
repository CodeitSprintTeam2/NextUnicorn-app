import { NavLink } from "react-router-dom";
import "./SiteHeader.css";

const links = [
  { to: "/compare", label: "나의 기업 비교" },
  { to: "/compare/status", label: "비교 현황" },
  { to: "/investments", label: "투자 현황" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink className="site-logo" to="/companies" aria-label="View My Startup 홈">
          <span>view my</span>
          <strong>startup</strong>
        </NavLink>
        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/companies" end className={({ isActive }) => `site-nav__link${isActive ? " is-active" : ""}`}>
            전체 스타트업
          </NavLink>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/compare"}
              className={({ isActive }) => `site-nav__link${isActive ? " is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
