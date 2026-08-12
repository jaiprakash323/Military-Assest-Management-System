import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const DataTable = ({ columns, data, pagination, onPageChange, loading }) => {
  if (loading) {
    return (
      <div className="data-table-wrapper">
        <div style={{ padding: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 48, marginBottom: 8, borderRadius: 'var(--radius-sm)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table-wrapper">
        <div className="empty-state">
          <Inbox size={48} />
          <p>No records found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.style}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((col) => (
                <td key={col.key} style={col.cellStyle}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={14} />
          </button>

          {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
            let pageNum;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="pagination-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight size={14} />
          </button>

          <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginLeft: '8px',
          }}>
            {pagination.total} total
          </span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
