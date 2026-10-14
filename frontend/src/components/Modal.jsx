import { useEffect, useId, useRef } from "react";
import styles from "./Modal.module.css";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function trapFocus(event, dialog) {
  if (event.key !== "Tab" || !dialog) return;

  const focusableElements = [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)];
  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

export function Modal({ open, onClose, title, children, className = "" }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const id = useId();
  const titleId = `modal-title-${id}`;

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current?.();
        return;
      }

      trapFocus(event, dialogRef.current);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose?.();
  }

  return (
    <div className={styles.backdrop} onMouseDown={handleBackdropClick}>
      <section
        ref={dialogRef}
        className={`${styles.dialog} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <button
            className={styles.close}
            type="button"
            aria-label="닫기"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  );
}
