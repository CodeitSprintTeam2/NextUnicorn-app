import { useState } from "react";
import { classifyApiError } from "../../api/errors.js";
import { Button } from "../../components/Button.jsx";
import { CompanyMark } from "../../components/CompanyMark.jsx";
import { Modal } from "../../components/Modal.jsx";
import { formatKoreanAmount } from "../../utils/amount.js";
import { INVESTMENT_MODE } from "./investment.constants.js";
import { validatePassword } from "./investmentValidation.js";
import { createInvestment, deleteInvestment, updateInvestment } from "./investments.api.js";
import { InvestmentForm } from "./InvestmentForm.jsx";
import styles from "./InvestmentDialogs.module.css";

export function InvestmentDialogs(props) {
  if (!props.mode) return null;

  // Each opening owns its password and errors; closing unmounts that state.
  return <InvestmentDialog key={`${props.mode}-${props.investment?.id ?? "new"}`} {...props} />;
}

function InvestmentDialog({ company, mode, investment, onClose, onChanged }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const isCreate = mode === INVESTMENT_MODE.create;

  async function saveInvestment(values) {
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const payload = {
        investorName: values.investorName,
        amount: values.amount,
        comment: values.comment,
        password: values.password,
      };

      if (isCreate) {
        await createInvestment({
          ...payload,
          companyId: Number(company.id),
          passwordConfirm: values.passwordConfirm,
        });
      } else {
        await updateInvestment(investment.id, payload);
      }

      onChanged?.();
      onClose?.();
    } catch (apiError) {
      setError(classifyApiError(apiError).message);
    } finally {
      setPending(false);
    }
  }

  async function removeInvestment() {
    if (pending) return;

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setPending(true);
    setError("");

    try {
      await deleteInvestment(investment.id, password);
      onChanged?.();
      onClose?.();
    } catch (apiError) {
      setError(classifyApiError(apiError).message);
    } finally {
      setPending(false);
    }
  }

  if (mode === INVESTMENT_MODE.delete) {
    return (
      <Modal open title="투자 내역 삭제" onClose={onClose}>
        <p className={styles.deleteSummary}>
          {investment?.investorName} · {formatKoreanAmount(investment?.amount)}
        </p>
        <label className={styles.field}>
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <Button variant="outline" disabled={pending} onClick={onClose}>취소</Button>
          <Button disabled={pending} onClick={removeInvestment}>삭제하기</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      title={isCreate ? "기업에 투자하기" : "투자 내역 수정"}
      onClose={onClose}
      className={styles.dialog}
    >
      {isCreate && (
        <div className={styles.company}>
          <CompanyMark company={company} size="sm" />
          <strong>{company?.name}</strong>
          <small>{company?.category}</small>
        </div>
      )}
      <InvestmentForm
        mode={mode}
        investment={investment}
        pending={pending}
        serverError={error}
        onFieldChange={() => setError("")}
        onSubmit={saveInvestment}
        onCancel={onClose}
      />
    </Modal>
  );
}
