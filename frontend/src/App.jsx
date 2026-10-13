import { Navigate, Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { CompaniesPage } from "./pages/CompaniesPage.jsx";
import { CompanyDetailPage } from "./pages/CompanyDetailPage.jsx";
import { ComparePage } from "./pages/ComparePage.jsx";
import { ComparisonStatusPage } from "./pages/ComparisonStatusPage.jsx";
import { InvestmentsPage } from "./pages/InvestmentsPage.jsx";

export default function App() {
  return (
    <>
      <SiteHeader />
      <main className="app-main">
        <Routes>
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/compare/status" element={<ComparisonStatusPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="*" element={<Navigate to="/companies" replace />} />
        </Routes>
      </main>
    </>
  );
}
