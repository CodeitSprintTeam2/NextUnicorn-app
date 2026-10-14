const WON_PER_EOK_TENTH = 10_000_000n;
const WON_PER_MAN = 10_000n;
const TENTHS_PER_WHOLE = 10n;
const INVALID_AMOUNT = "-";
const numberFormatter = new Intl.NumberFormat("ko-KR");

export function formatKoreanAmount(value) {
  if (value === null || value === undefined || value === "") {
    return INVALID_AMOUNT;
  }

  let amount;
  try {
    amount = BigInt(value);
  } catch {
    return INVALID_AMOUNT;
  }

  if (amount < 0n) return INVALID_AMOUNT;

  if (amount >= WON_PER_EOK_TENTH) {
    const tenths = amount / WON_PER_EOK_TENTH;
    const whole = tenths / TENTHS_PER_WHOLE;
    const decimal = tenths % TENTHS_PER_WHOLE;
    const formattedWhole = numberFormatter.format(whole);
    const amountInEok = decimal === 0n
      ? formattedWhole
      : `${formattedWhole}.${decimal}`;

    return `${amountInEok}억 원`;
  }

  if (amount >= WON_PER_MAN) {
    return `${numberFormatter.format(amount / WON_PER_MAN)}만 원`;
  }

  return `${numberFormatter.format(amount)}원`;
}
