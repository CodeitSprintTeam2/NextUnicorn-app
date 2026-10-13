import { useEffect, useState } from "react";
import { validateInvestment } from "../utils/validation.js";
import "./InvestmentForm.css";

const emptyValues = {
  investorName: "",
  amount: "",
  comment: "",
  password: "",
  passwordConfirm: "",
};

function PasswordField({ id, label, value, onChange, error, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="investment-field" htmlFor={id}>
      <span>{label}</span>
      <span className={`investment-field__password${error ? " has-error" : ""}`}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <button type="button" aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setVisible((current) => !current)}>
          {visible ? "숨김" : "보기"}
        </button>
      </span>
      {error ? <small className="investment-field__error" id={`${id}-error`}>{error}</small> : null}
    </label>
  );
}

export function InvestmentForm({ mode = "create", initialValues, pending = false, serverError, onSubmit, onCancel }) {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const creating = mode === "create";

  useEffect(() => {
    setValues({
      ...emptyValues,
      investorName: initialValues?.investorName ?? "",
      amount: initialValues?.amount ?? "",
      comment: initialValues?.comment ?? "",
    });
    setErrors({});
  }, [mode, initialValues?.id, initialValues?.investorName, initialValues?.amount, initialValues?.comment]);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateInvestment(values, { mode });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit?.({
      ...values,
      investorName: values.investorName.trim(),
      amount: values.amount,
      comment: values.comment.trim(),
    });
  }

  return (
    <form className="investment-form" onSubmit={handleSubmit} noValidate>
      <label className="investment-field" htmlFor="investment-investor-name">
        <span>투자자 이름</span>
        <input
          id="investment-investor-name"
          maxLength={20}
          value={values.investorName}
          onChange={(event) => setField("investorName", event.target.value)}
          aria-invalid={Boolean(errors.investorName)}
          aria-describedby={errors.investorName ? "investment-investor-name-error" : undefined}
        />
        {errors.investorName ? <small className="investment-field__error" id="investment-investor-name-error">{errors.investorName}</small> : null}
      </label>

      <label className="investment-field" htmlFor="investment-amount">
        <span>투자 금액</span>
        <input
          id="investment-amount"
          inputMode="numeric"
          value={values.amount}
          onChange={(event) => setField("amount", event.target.value)}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "investment-amount-error" : undefined}
        />
        {errors.amount ? <small className="investment-field__error" id="investment-amount-error">{errors.amount}</small> : null}
      </label>

      <label className="investment-field" htmlFor="investment-comment">
        <span>투자 코멘트</span>
        <textarea
          id="investment-comment"
          maxLength={200}
          rows={3}
          value={values.comment}
          onChange={(event) => setField("comment", event.target.value)}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={errors.comment ? "investment-comment-error" : undefined}
        />
        {errors.comment ? <small className="investment-field__error" id="investment-comment-error">{errors.comment}</small> : null}
      </label>

      <PasswordField
        id="investment-password"
        label={creating ? "비밀번호" : "기존 비밀번호"}
        value={values.password}
        onChange={(value) => setField("password", value)}
        error={errors.password}
        autoComplete={creating ? "new-password" : "current-password"}
      />
      {creating ? (
        <PasswordField
          id="investment-password-confirm"
          label="비밀번호 확인"
          value={values.passwordConfirm}
          onChange={(value) => setField("passwordConfirm", value)}
          error={errors.passwordConfirm}
          autoComplete="new-password"
        />
      ) : null}

      {serverError ? <p className="investment-form__server-error" role="alert">{serverError}</p> : null}
      <div className="investment-form__actions">
        <button className="button button--outline" type="button" disabled={pending} onClick={onCancel}>취소</button>
        <button className="button" type="submit" disabled={pending}>{pending ? "처리 중..." : creating ? "투자하기" : "수정하기"}</button>
      </div>
    </form>
  );
}
