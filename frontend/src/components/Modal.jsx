import { useEffect, useId, useRef } from "react";
import "./Modal.css";
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
export function Modal({open,onClose,title,children,className=""}) {
  const dialogRef=useRef(null); const closeRef=useRef(onClose); const id=useId();
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{if(!open)return; const previous=document.activeElement; const overflow=document.body.style.overflow; document.body.style.overflow="hidden"; dialogRef.current?.querySelector(FOCUSABLE)?.focus();
    function onKey(event){if(event.key==="Escape"){event.stopPropagation();closeRef.current?.();return;} if(event.key!=="Tab"||!dialogRef.current)return;const items=[...dialogRef.current.querySelectorAll(FOCUSABLE)];if(!items.length){event.preventDefault();return;}if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}}
    document.addEventListener("keydown",onKey);return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=overflow;previous?.focus?.();};
  },[open]);
  if(!open)return null;
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose?.()}><section ref={dialogRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={`modal-title-${id}`}><header className="modal__header"><h2 id={`modal-title-${id}`}>{title}</h2><button className="modal__close" type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="modal__body">{children}</div></section></div>;
}
