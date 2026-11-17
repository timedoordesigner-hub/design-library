// 1 … 4 5 [6] 7 8 … 20
const pageNumbers = (current: number, total: number) => {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const list: (number | "gap")[] = [];
  for (let n = 1; n <= total; n++) {
    if (!keep.has(n)) {
      if (list.at(-1) !== "gap") list.push("gap");
      continue;
    }
    list.push(n);
  }
  return list;
};

export const PAGE_SIZES = [10, 25, 50, 100];

type Props = {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
};

// Same look as the Manage Video Library pager (.ads-pager*), plus a per-page selector.
export function Pager({ page, pageSize, total, noun, onPage, onPageSize }: Props) {
  if (!total) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return (
    <nav className="ads-pager" aria-label={`${noun} pages`}>
      <p className="ads-pager-info">
        Showing {start + 1}–{end} of {total} {noun}
      </p>
      <div className="ads-pager-nav">
        <label className="ads-pager-size">
          <span>Per page</span>
          <select className="control-select" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} aria-label="Items per page">
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        {totalPages > 1 && (
          <>
            <button type="button" className="ads-pager-btn" disabled={current === 1} onClick={() => onPage(current - 1)} aria-label="Previous page">‹</button>
            {pageNumbers(current, totalPages).map((item, index) =>
              item === "gap" ? (
                <span className="ads-pager-gap" key={`gap-${index}`} aria-hidden="true">…</span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={`ads-pager-btn${item === current ? " active" : ""}`}
                  aria-current={item === current ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  onClick={() => onPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button type="button" className="ads-pager-btn" disabled={current === totalPages} onClick={() => onPage(current + 1)} aria-label="Next page">›</button>
            <span className="ads-pager-total">Page {current} of {totalPages}</span>
          </>
        )}
      </div>
    </nav>
  );
}
