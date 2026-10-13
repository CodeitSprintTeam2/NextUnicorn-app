import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL 환경 변수가 필요합니다.");
}

export const apiClient = axios.create({ baseURL });
