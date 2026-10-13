import { useEffect, useState } from "react";
import { createInvestment, deleteInvestment, updateInvestment } from "../api/investments.js";
import { classifyApiError } from "../api/errors.js";
import { formatKoreanAmount } from "../utils/amount.js";
import { CompanyMark } from "./CompanyMark.jsx";
import { InvestmentForm } from "./InvestmentForm.jsx";
import { Modal } from "./Modal.jsx";
import "./InvestmentDialogs.css";

export function InvestmentDialogs({ company, mode, investment, onClose, onChanged }) {
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    setPending(false);
    setServerError("");
    setNotice("");
    setDeletePassword("");
  }, [mode, investment?.id]);

  async function handleFormSubmit(values) {
    if (!company?.id) return;
    setPending(true);
    setServerError("");
    try {
      if (mode === "create") {
        await createInvestment({
          companyId: Number(company.id),
          investorName: values.investorName,
          amount: values.amount,
          comment: values.comment,
          password: values.password,
          passwordConfirm: values.passwordConfirm,
        });
      } else if (mode === "update" && investment?.id) {
        await updateInvestment(investment.id, {
          investorName: values.investorName,
          amount: values.amount,
          comment: values.comment,
          password: values.password,
        });
      }
      onChanged?.();
      onClose?.();
    } catch (error) {
      const result = classifyApiError(error);
      setServerError(result.message);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (deletePassword.length < 4 || deletePassword.length > 20) {
      setServerError("비밀번호는 4자 이상 20자 이하로 입력해 주세요.");
      return;
    }
    setPending(true);
    setServerError("");
    try {
      await deleteInvestment(investment.id, deletePassword);
      onChanged?.();
      onClose?.();
    } catch (error) {
      setNotice(classifyApiError(error).message);
    } finally {
      setPending(false);
    }
  }

  if (!mode) return null;
  if (notice) {
    return (
      <Modal open title="투자 내역을 삭제할 수 없어요" onClose={() => setNotice("")} className="modal--notice">
        <p className="investment-delete__notice" role="alert">{notice}</p>
        <div className="investment-delete__actions">
          <button className="button" type="button" onClick={() => setNotice("")}>확인</button>
        </div>
      </Modal>
    );
  }

  if (mode === "delete") {
    return (
      <Modal open title="투자 내역 삭제" onClose={onClose} className="modal--delete">
        <div className="investment-delete__summary">
          <strong>{investment?.investorName}</strong>
          <span>{formatKoreanAmount(investment?.amount)}</span>
        </div>
        <p className="investment-delete__hint">삭제하려면 등록할 때 사용한 비밀번호를 입력해 주세요.</p>
        <label className="investment-field" htmlFor="investment-delete-password">
          <span>비밀번호</span>
          <input id="investment-delete-password" type="password" value={deletePassword} autoComplete="current-password" onChange={(event) => { setDeletePassword(event.target.value); setServerError(""); }} />
          {serverError ? <small className="investment-field__error" role="alert">{serverError}</small> : null}
        </label>
        <div className="investment-form__actions">
          <button className="button button--outline" type="button" disabled={pending} onClick={onClose}>취소</button>
          <button className="button" type="button" disabled={pending} onClick={handleDelete}>{pending ? "삭제 중..." : "삭제하기"}</button>
        </div>
      </Modal>
    );
  }

  const creating = mode === "create";
  return (
    <Modal open title={creating ? "기업에 투자하기" : "투자 내역 수정"} onClose={onClose} className="modal--investment">
      {creating && company ? (
        <div className="investment-dialog__company">
          <CompanyMark company={company} size="sm" />
          <span>{company.name}</span>
          <small>{company.category}</small>
        </div>
      ) : null}
      <InvestmentForm
        key={`${mode}-${investment?.id ?? "new"}`}
        mode={mode}
        initialValues={investment}
        pending={pending}
        serverError={serverError}
        onSubmit={handleFormSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
