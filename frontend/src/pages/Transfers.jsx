import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import { ArrowRightLeft, Plus, X, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const Transfers = () => {
  const { hasRole } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    sourceBaseId: '',
    destBaseId: '',
    equipmentTypeId: '',
    quantity: '',
  });

  const fetchTransfers = async (page = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filterParams };
      const res = await api.get('/transfers', { params });
      setTransfers(res.data.transfers);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [basesRes, equipRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(equipRes.data);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchFormData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTransfers(1, newFilters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/transfers', {
        sourceBaseId: parseInt(formData.sourceBaseId),
        destBaseId: parseInt(formData.destBaseId),
        equipmentTypeId: parseInt(formData.equipmentTypeId),
        quantity: parseInt(formData.quantity),
      });
      setToast({ type: 'success', message: 'Transfer completed successfully!' });
      setShowForm(false);
      setFormData({ sourceBaseId: '', destBaseId: '', equipmentTypeId: '', quantity: '' });
      fetchTransfers(1, filters);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Transfer failed' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      COMPLETED: 'badge-emerald',
      IN_TRANSIT: 'badge-amber',
      PENDING: 'badge-blue',
      CANCELLED: 'badge-red',
    };
    return statusMap[status] || 'badge-purple';
  };

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
      key: 'route',
      label: 'Transfer Route',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 10px',
            background: 'var(--accent-red-glow)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-red)',
          }}>
            {row.sourceBase?.name}
          </span>
          <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            padding: '4px 10px',
            background: 'var(--accent-emerald-glow)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-emerald)',
          }}>
            {row.destBase?.name}
          </span>
        </div>
      ),
    },
    {
      key: 'equipmentType',
      label: 'Equipment',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.equipmentType?.name}</div>
          <span className={`badge ${
            row.equipmentType?.category === 'WEAPON' ? 'badge-red' :
            row.equipmentType?.category === 'VEHICLE' ? 'badge-blue' :
            'badge-amber'
          }`} style={{ marginTop: 4 }}>
            {row.equipmentType?.category}
          </span>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (row) => (
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {row.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })}
        </span>
      ),
    },
    {
      key: 'initiatedBy',
      label: 'By',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {row.user?.username}
        </span>
      ),
    },
  ];

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArrowRightLeft size={28} style={{ color: 'var(--accent-purple)' }} />
          <div>
            <h1 className="page-title">Transfers</h1>
            <p className="page-subtitle">Manage base-to-base asset movements</p>
          </div>
        </div>
        {hasRole('ADMIN', 'LOGISTICS_OFFICER') && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            New Transfer
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      <DataTable
        columns={columns}
        data={transfers}
        pagination={pagination}
        onPageChange={(page) => fetchTransfers(page, filters)}
        loading={loading}
      />

      {/* Transfer Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px',
            }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Initiate Transfer</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="transfer-source-base" className="form-label">Source Base</label>
                <select
                  id="transfer-source-base"
                  className="form-select"
                  value={formData.sourceBaseId}
                  onChange={(e) => setFormData({ ...formData, sourceBaseId: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select Source</option>
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="transfer-dest-base" className="form-label">Destination Base</label>
                <select
                  id="transfer-dest-base"
                  className="form-select"
                  value={formData.destBaseId}
                  onChange={(e) => setFormData({ ...formData, destBaseId: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select Destination</option>
                  {bases.filter(b => String(b.id) !== formData.sourceBaseId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="transfer-equipment-type" className="form-label">Equipment Type</label>
                <select
                  id="transfer-equipment-type"
                  className="form-select"
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="transfer-quantity" className="form-label">Quantity</label>
                <input
                  id="transfer-quantity"
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  min="1"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {/* Transfer Route Preview */}
              {formData.sourceBaseId && formData.destBaseId && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: 'rgba(139, 92, 246, 0.06)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  fontSize: '13px',
                }}>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                    {bases.find(b => String(b.id) === formData.sourceBaseId)?.name}
                  </span>
                  <ArrowRight size={16} style={{ color: 'var(--accent-purple)' }} />
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {bases.find(b => String(b.id) === formData.destBaseId)?.name}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={16} />
                    Execute Transfer
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
