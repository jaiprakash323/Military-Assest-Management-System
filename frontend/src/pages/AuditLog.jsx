import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import { ScrollText, ShoppingCart, ArrowRightLeft, Users, Flame, FileText } from 'lucide-react';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (page = 1, action = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (action) params.action = action;
      const res = await api.get('/assets/audit-logs', { params });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleActionFilter = (action) => {
    setActionFilter(action);
    fetchLogs(1, action);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'PURCHASE': return <ShoppingCart size={14} />;
      case 'TRANSFER': case 'TRANSFER_STATUS_UPDATE': return <ArrowRightLeft size={14} />;
      case 'ASSIGNMENT': return <Users size={14} />;
      case 'EXPENDITURE': return <Flame size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'PURCHASE': return 'badge-blue';
      case 'TRANSFER': case 'TRANSFER_STATUS_UPDATE': return 'badge-purple';
      case 'ASSIGNMENT': return 'badge-amber';
      case 'EXPENDITURE': return 'badge-red';
      default: return 'badge-emerald';
    }
  };

  const actionButtons = [
    { key: '', label: 'All' },
    { key: 'PURCHASE', label: 'Purchases' },
    { key: 'TRANSFER', label: 'Transfers' },
    { key: 'ASSIGNMENT', label: 'Assignments' },
    { key: 'EXPENDITURE', label: 'Expenditures' },
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => (
        <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
          #{row.id}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (row) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            {new Date(row.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {new Date(row.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit', second: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <span className={`badge ${getActionBadge(row.action)}`} style={{ gap: '4px' }}>
          {getActionIcon(row.action)}
          {row.action}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.user?.username}</div>
          <span className={`badge ${
            row.user?.role === 'ADMIN' ? 'badge-red' :
            row.user?.role === 'BASE_COMMANDER' ? 'badge-amber' : 'badge-blue'
          }`} style={{ marginTop: 2 }}>
            {row.user?.role?.replace('_', ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'entity',
      label: 'Entity',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {row.entity} {row.entityId ? `#${row.entityId}` : ''}
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (row) => (
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          maxWidth: '300px',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {row.details}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ScrollText size={28} style={{ color: 'var(--accent-emerald)' }} />
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Complete system activity trail — Admin access only</p>
        </div>
      </div>

      {/* Action Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {actionButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleActionFilter(btn.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${actionFilter === btn.key ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
              background: actionFilter === btn.key ? 'var(--accent-blue-glow)' : 'rgba(255,255,255,0.02)',
              color: actionFilter === btn.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={logs}
        pagination={pagination}
        onPageChange={(page) => fetchLogs(page, actionFilter)}
        loading={loading}
      />
    </div>
  );
};

export default AuditLog;
