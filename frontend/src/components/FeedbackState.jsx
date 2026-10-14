import { QUERY_STATE } from "../api/queryState.js";
import { Button } from "./Button.jsx";
import styles from "./FeedbackState.module.css";

const STATE_COPY = {
  [QUERY_STATE.loading]: ["불러오는 중이에요", "잠시만 기다려 주세요."],
  [QUERY_STATE.empty]: ["표시할 내용이 없어요", "조건을 바꾸거나 다른 화면을 확인해 주세요."],
  [QUERY_STATE.unavailable]: [
    "기능 API를 사용할 수 없어요",
    "서버에서 이 기능을 제공하면 이용할 수 있습니다.",
  ],
  [QUERY_STATE.error]: ["내용을 불러오지 못했어요", "잠시 후 다시 시도해 주세요."],
};

export function FeedbackState({
  state = QUERY_STATE.empty,
  title,
  message,
  onRetry,
  compact = false,
}) {
  const [defaultTitle, defaultMessage] = STATE_COPY[state] ?? STATE_COPY.error;
  const className = [styles.container, compact && styles.compact]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={className} aria-live="polite">
      {state === QUERY_STATE.loading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      <h2>{title ?? defaultTitle}</h2>
      <p>{message ?? defaultMessage}</p>
      {onRetry && state !== QUERY_STATE.loading && (
        <Button variant="quiet" onClick={onRetry}>다시 시도</Button>
      )}
    </section>
  );
}
