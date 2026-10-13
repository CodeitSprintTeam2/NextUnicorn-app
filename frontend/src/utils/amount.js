const EOK_WON = 10_000_000n;
const MAN_WON = 10_000n;

function groupInteger(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatKoreanAmount(value) {
  if (value === null || value === undefined || value === "") return "-";

  let amount;
  try {
    amount = BigInt(value);
  } catch {
    return "-";
  }

  if (amount < 0n) return "-";
  if (amount >= EOK_WON) {
    const tenths = amount / EOK_WON;
    const whole = tenths / 10n;
    const decimal = tenths % 10n;
    const valueInEok = decimal === 0n ? groupInteger(whole) : `${groupInteger(whole)}.${decimal}`;
    return `${valueInEok}억 원`;
  }
  if (amount >= MAN_WON) return `${groupInteger(amount / MAN_WON)}만 원`;
  return `${groupInteger(amount)}원`;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
