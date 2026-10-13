import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { apiClient } from "./api/client.js";

function CompaniesPage() {
  const [serverStatus, setServerStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function checkServer() {
      try {
        const response = await apiClient.get("/health");

        if (active && response.data?.data?.status === "ok") {
          setServerStatus("connected");
        }
      } catch {
        if (active) {
          setServerStatus("error");
        }
      }
    }

    checkServer();

    return () => {
      active = false;
    };
  }, []);

  const messages = {
    loading: "서버 연결을 확인하고 있습니다.",
    connected: "서버와 연결되었습니다.",
    error: "서버에 연결할 수 없습니다.",
  };

  return (
    <main className="page-shell">
      <section className="status-card" aria-live="polite">
        <p className="eyebrow">VIEW MY STARTUP</p>
        <h1>기업 목록</h1>
        <p className={`server-status server-status--${serverStatus}`}>
          {messages[serverStatus]}
        </p>
        <p className="description">
          프로젝트 실행 기반이 준비되었습니다. 기업 목록은 다음 이슈에서 연결합니다.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="*" element={<Navigate to="/companies" replace />} />
    </Routes>
  );
}
