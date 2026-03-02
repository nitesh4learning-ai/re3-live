"use client";
import { GIM } from "../constants";

export default function ComparisonTable({ title, columns, headers, rows = [] }) {
  const cols = columns || headers || [];
  return (
    <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: GIM.border }}>
      {title && (
        <div className="px-4 py-2" style={{ background: GIM.borderLight, borderBottom: `1px solid ${GIM.border}` }}>
          <span className="font-semibold" style={{ fontSize: 13, color: GIM.headingText, fontFamily: GIM.fontMain }}>
            {title}
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13, fontFamily: GIM.fontMain }}>
          <thead>
            <tr style={{ background: GIM.borderLight }}>
              {cols.map((c, i) => (
                <th key={i} className="text-left p-3 font-semibold" scope="col" style={{ color: GIM.headingText }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${GIM.border}` }}>
                {(row || []).map((cell, j) => (
                  <td
                    key={j}
                    className="p-3"
                    style={{ color: j === 0 ? GIM.headingText : GIM.bodyText, fontWeight: j === 0 ? 600 : 400 }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
