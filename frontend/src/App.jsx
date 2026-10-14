import { Navigate, Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader.jsx";
import CompaniesPage from "./pages/CompaniesPage.jsx";
import CompanyDetailPage from "./pages/CompanyDetailPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import ComparisonStatusPage from "./pages/ComparisonStatusPage.jsx";
import InvestmentsPage from "./pages/InvestmentsPage.jsx";
import { ROUTES } from "./utils/routes.js";
import styles from "./App.module.css";

export default function App() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <Routes>
          <Route path={ROUTES.companies} element={<CompaniesPage />} />
          <Route path={ROUTES.companyDetail} element={<CompanyDetailPage />} />
          <Route path={ROUTES.compare} element={<ComparePage />} />
          <Route path={ROUTES.comparisonStatus} element={<ComparisonStatusPage />} />
          <Route path={ROUTES.investments} element={<InvestmentsPage />} />
          <Route path="*" element={<Navigate to={ROUTES.companies} replace />} />
        </Routes>
      </main>
    </>
  );
}
