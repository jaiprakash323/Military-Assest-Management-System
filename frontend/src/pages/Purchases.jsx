import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import { ShoppingCart, Plus, X, Loader2, CheckCircle } from 'lucide-react';

const Purchases = () => {
  const { hasRole } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    baseId: '',
    equipmentTypeId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchPurchases = async (page = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filterParams };
      const res = await api.get('/purchases', { params });
      setPurchases(res.data.purchases);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
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
    fetchPurchases();
    fetchFormData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchPurchases(1, newFilters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/purchases', {
        baseId: parseInt(formData.baseId),
        equipmentTypeId: parseInt(formData.equipmentTypeId),
        quantity: parseInt(formData.quantity),
        date: formData.date,
      });
      setToast({ type: 'success', message: 'Purchase recorded successfully!' });
      setShowForm(false);
      setFormData({ baseId: '', equipmentTypeId: '', quantity: '', date: new Date().toISOString().split('T')[0] });
      fetchPurchases(1, filters);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create purchase' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
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
      key: 'base',
      label: 'Base',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.base?.name}</span>
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
      label: 'Quantity',
      render: (row) => (
        <span style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--accent-emerald)',
        }}>
          +{row.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {new Date(row.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Logged By',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {row.user?.username}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingCart size={28} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          <div>
            <h1 className="page-title">Purchases</h1>
            <p className="page-subtitle">Log incoming assets & view purchase history</p>
          </div>
        </div>
        {hasRole('ADMIN', 'LOGISTICS_OFFICER') && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            New Purchase
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={purchases}
        pagination={pagination}
        onPageChange={(page) => fetchPurchases(page, filters)}
        loading={loading}
      />

      {/* Create Purchase Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Record New Purchase</h2>
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
                <label htmlFor="purchase-base" className="form-label">Base</label>
                <select
                  id="purchase-base"
                  className="form-select"
                  value={formData.baseId}
                  onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select Base</option>
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="purchase-equipment-type" className="form-label">Equipment Type</label>
                <select
                  id="purchase-equipment-type"
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

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="purchase-quantity" className="form-label">Quantity</label>
                <input
                  id="purchase-quantity"
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

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="purchase-date" className="form-label">Date</label>
                <input
                  id="purchase-date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Recording...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Record Purchase
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

export default Purchases;
