import styles from "./PageHeading.module.css";

export function PageHeading({ title, children }) {
  return (
    <div className={styles.heading}>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </div>
  );
}
