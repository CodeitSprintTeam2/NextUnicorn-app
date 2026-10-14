import { Link } from "react-router-dom";
import styles from "./Button.module.css";

function buttonClassName(variant, className) {
  return [styles.button, styles[variant], className].filter(Boolean).join(" ");
}

export function Button({ variant = "primary", className, type = "button", ...props }) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClassName(variant, className)}
    />
  );
}

export function ButtonLink({ variant = "primary", className, ...props }) {
  return <Link {...props} className={buttonClassName(variant, className)} />;
}
