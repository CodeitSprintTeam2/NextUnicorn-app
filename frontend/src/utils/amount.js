const EOK_WON = 10_000_000n;
const MAN_WON = 10_000n;
export function formatKoreanAmount(value) {
  if (value === null || value === undefined || value === "") return "-";
  let amount;
  try { amount = BigInt(value); } catch { return "-"; }
  if (amount < 0n) return "-";
  if (amount >= EOK_WON) {
    const tenths = amount / EOK_WON;
    const whole = tenths / 10n;
    const decimal = tenths % 10n;
    const amountInEok = decimal === 0n ? new Intl.NumberFormat("ko-KR").format(whole) : `${new Intl.NumberFormat("ko-KR").format(whole)}.${decimal}`;
    return `${amountInEok}억 원`;
  }
  if (amount >= MAN_WON) return `${new Intl.NumberFormat("ko-KR").format(amount / MAN_WON)}만 원`;
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}
