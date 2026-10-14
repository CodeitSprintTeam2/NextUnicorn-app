import { Link } from "react-router-dom";
import { CompanyMark } from "./CompanyMark.jsx";
import styles from "./CompanyDataTable.module.css";

function renderCell(row, column, index, rowHref) {
  if (column.render) return column.render(row, index);

  if (column.key === "name" && rowHref) {
    return (
      <Link className={styles.companyLink} to={rowHref(row)}>
        <CompanyMark company={row} size="sm" />
        <span>{row.name}</span>
      </Link>
    );
  }

  return row[column.key] ?? "-";
}

function DesktopTable({ rows, columns, rowHref, getKey }) {
  return (
    <div className={styles.desktop}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={getKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{renderCell(row, column, index, rowHref)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileCards({ rows, columns, rowHref, getKey }) {
  const fieldColumns = columns.filter(
    (column) => column.key !== "name" && column.key !== "description",
  );

  return (
    <div className={styles.mobile}>
      {rows.map((row, index) => (
        <article className={styles.card} key={getKey(row)}>
          <div className={styles.identity}>
            {row.name && <CompanyMark company={row} />}
            <div>
              {rowHref && row.name ? (
                <Link to={rowHref(row)}>{row.name}</Link>
              ) : (
                <strong>{row.name ?? "기업 정보"}</strong>
              )}
              {row.description && <p>{row.description}</p>}
            </div>
          </div>
          <dl className={styles.fields}>
            {fieldColumns.map((column) => (
              <div key={column.key}>
                <dt>{column.label}</dt>
                <dd>{renderCell(row, column, index, rowHref)}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

export function CompanyDataTable({
  rows = [],
  columns = [],
  rowHref,
  getKey = (row) => row.id,
}) {
  if (!rows.length) return null;

  return (
    <div className={styles.container}>
      <DesktopTable rows={rows} columns={columns} rowHref={rowHref} getKey={getKey} />
      <MobileCards rows={rows} columns={columns} rowHref={rowHref} getKey={getKey} />
    </div>
  );
}
