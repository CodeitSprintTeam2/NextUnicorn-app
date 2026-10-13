import "./FeedbackState.css";
const STATE_COPY = { loading:["불러오는 중이에요","잠시만 기다려 주세요."], empty:["표시할 내용이 없어요","조건을 바꾸거나 다른 화면을 확인해 주세요."], unavailable:["기능 API를 사용할 수 없어요","서버에서 이 기능을 제공하면 이용할 수 있습니다."], error:["내용을 불러오지 못했어요","잠시 후 다시 시도해 주세요."] };
export function FeedbackState({state="empty",title,message,onRetry,compact=false}) {
  const [defaultTitle, defaultBody] = STATE_COPY[state] ?? STATE_COPY.error;
  return <section className={`feedback-state feedback-state--${state}${compact?" feedback-state--compact":""}`} aria-live="polite">{state==="loading"&&<span className="feedback-state__spinner" aria-hidden="true"/>}<h2>{title??defaultTitle}</h2><p>{message??defaultBody}</p>{onRetry&&state!=="loading"&&<button className="button button--quiet" type="button" onClick={onRetry}>다시 시도</button>}</section>;
}
