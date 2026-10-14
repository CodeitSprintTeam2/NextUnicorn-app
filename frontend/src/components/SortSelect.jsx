import styles from "./SortSelect.module.css";

export function SortSelect({ label, value, options, onChange, className = "" }) {
  return (
    <label className={`${styles.field} ${className}`}>
      <span className="visually-hidden">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
