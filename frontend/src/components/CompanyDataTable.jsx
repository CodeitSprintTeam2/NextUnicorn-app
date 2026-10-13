import { Link } from "react-router-dom";
import { CompanyMark } from "./CompanyMark.jsx";
import "./CompanyDataTable.css";

function cellContent(row, column, index, rowHref) {
  if (column.render) return column.render(row, index);
  if (column.key === "name" && rowHref) {
    return (
      <Link className="data-table__company" to={rowHref(row)}>
        <CompanyMark company={row} size="sm" />
        <span>{row.name}</span>
      </Link>
    );
  }
  return row[column.key] ?? "-";
}

export function CompanyDataTable({ rows = [], columns = [], rowHref, getKey = (row) => row.id }) {
  if (rows.length === 0) return null;

  return (
    <div className="company-data-table">
      <div className="company-data-table__desktop">
        <div className="company-data-table__scroll">
          <table className="data-table">
            <thead>
              <tr>{columns.map((column) => <th key={column.key} scope="col" style={column.width ? { width: column.width } : undefined}>{column.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={getKey(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {cellContent(row, column, index, rowHref)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="company-data-table__mobile">
        {rows.map((row, index) => (
          <article className="data-table-card" key={getKey(row)}>
            <div className="data-table-card__identity">
              {row.name ? <CompanyMark company={row} size="md" /> : null}
              <div>
                {rowHref && row.name ? <Link to={rowHref(row)}>{row.name}</Link> : <strong>{row.name ?? columns[0]?.render?.(row, index) ?? "기업 정보"}</strong>}
                {row.description ? <p>{row.description}</p> : null}
              </div>
            </div>
            <dl className="data-table-card__fields">
              {columns.filter((column) => column.key !== "name").map((column) => (
                <div key={column.key}>
                  <dt>{column.label}</dt>
                  <dd>{cellContent(row, column, index, rowHref)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
