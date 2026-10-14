import { classifyApiError } from "./errors.js";

export const QUERY_STATE = {
  idle: "idle",
  loading: "loading",
  ready: "ready",
  empty: "empty",
  unavailable: "unavailable",
  error: "error",
};

export function getQueryFailure(error) {
  const failure = classifyApiError(error);
  return {
    state: failure.kind === "unavailable"
      ? QUERY_STATE.unavailable
      : QUERY_STATE.error,
    message: failure.message,
  };
}

export function canRetryQuery(state) {
  return state === QUERY_STATE.error || state === QUERY_STATE.unavailable;
}
