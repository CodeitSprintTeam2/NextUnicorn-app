export function classifyApiError(error) {
  const response = error?.response;
  const apiError = response?.data?.error;
  if (apiError?.code) return { kind: "contract", code: apiError.code, message: apiError.message ?? "요청을 처리하지 못했습니다." };
  if (response) return { kind: "unavailable", code: null, message: "이 기능의 API가 아직 준비되지 않았습니다." };
  return { kind: "network", code: null, message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." };
}
