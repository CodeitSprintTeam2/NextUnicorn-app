import { useState } from "react";
import { Button } from "../../components/Button.jsx";
import { INVESTMENT_LIMITS, INVESTMENT_MODE } from "./investment.constants.js";
import { validateInvestment } from "./investmentValidation.js";
import styles from "./InvestmentDialogs.module.css";

function InvestmentField({ label, error, ...inputProps }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input {...inputProps} aria-invalid={Boolean(error)} />
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

export function InvestmentForm({
  mode = INVESTMENT_MODE.create,
  investment,
  pending,
  serverError,
  onSubmit,
  onCancel,
}) {
  const isCreate = mode === INVESTMENT_MODE.create;
  const [values, setValues] = useState({
    investorName: investment?.investorName ?? "",
    amount: investment?.amount ?? "",
    comment: investment?.comment ?? "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});

  function handleFieldChange(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;

    const validationErrors = validateInvestment(values, { mode });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    onSubmit({
      ...values,
      investorName: values.investorName.trim(),
      comment: values.comment.trim(),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <InvestmentField
        label="투자자 이름"
        value={values.investorName}
        error={errors.investorName}
        onChange={(event) => handleFieldChange("investorName", event.target.value)}
      />
      <InvestmentField
        label="투자 금액"
        value={values.amount}
        error={errors.amount}
        onChange={(event) => handleFieldChange("amount", event.target.value)}
      />
      <label className={styles.field}>
        <span>투자 코멘트</span>
        <textarea
          maxLength={INVESTMENT_LIMITS.comment.max}
          rows={3}
          value={values.comment}
          aria-invalid={Boolean(errors.comment)}
          onChange={(event) => handleFieldChange("comment", event.target.value)}
        />
        {errors.comment && <small role="alert">{errors.comment}</small>}
      </label>
      <InvestmentField
        label={isCreate ? "비밀번호" : "기존 비밀번호"}
        type="password"
        value={values.password}
        error={errors.password}
        onChange={(event) => handleFieldChange("password", event.target.value)}
      />
      {isCreate && (
        <InvestmentField
          label="비밀번호 확인"
          type="password"
          value={values.passwordConfirm}
          error={errors.passwordConfirm}
          onChange={(event) => handleFieldChange("passwordConfirm", event.target.value)}
        />
      )}
      {serverError && <p className={styles.error} role="alert">{serverError}</p>}
      <div className={styles.actions}>
        <Button variant="outline" disabled={pending} onClick={onCancel}>취소</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "처리 중..." : isCreate ? "투자하기" : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
