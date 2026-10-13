import "./FeedbackState.css";

const stateCopy = {
  loading: { title: "불러오는 중이에요", body: "잠시만 기다려 주세요." },
  empty: { title: "표시할 내용이 없어요", body: "조건을 바꾸거나 다른 화면을 확인해 주세요." },
  unavailable: { title: "기능 API를 사용할 수 없어요", body: "서버에서 이 기능을 제공하면 이용할 수 있습니다." },
  error: { title: "내용을 불러오지 못했어요", body: "잠시 후 다시 시도해 주세요." },
};

export function FeedbackState({ state = "empty", title, message, onRetry, compact = false }) {
  const copy = stateCopy[state] ?? stateCopy.error;
  return (
    <section className={`feedback-state feedback-state--${state}${compact ? " feedback-state--compact" : ""}`} aria-live="polite">
      {state === "loading" ? <span className="feedback-state__spinner" aria-hidden="true" /> : null}
      <h2>{title ?? copy.title}</h2>
      <p>{message ?? copy.body}</p>
      {onRetry && state !== "loading" ? (
        <button className="button button--quiet" type="button" onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
    </section>
  );
}
