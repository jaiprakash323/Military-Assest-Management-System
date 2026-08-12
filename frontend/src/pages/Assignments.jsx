import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import { Users, Flame, Plus, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Assignments = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [assignPagination, setAssignPagination] = useState(null);
  const [expendPagination, setExpendPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({});

  const [assignForm, setAssignForm] = useState({
    baseId: '', equipmentTypeId: '', quantity: '', assignedTo: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [expendForm, setExpendForm] = useState({
    baseId: '', equipmentTypeId: '', quantity: '', description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async (page = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filterParams };
      const [assignRes, expendRes, basesRes, equipRes] = await Promise.all([
        api.get('/assignments', { params }),
        api.get('/expenditures', { params }),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setAssignments(assignRes.data.assignments);
      setAssignPagination(assignRes.data.pagination);
      setExpenditures(expendRes.data.expenditures);
      setExpendPagination(expendRes.data.pagination);
      setBases(basesRes.data);
      setEquipmentTypes(equipRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(1, newFilters);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/assignments', {
        baseId: parseInt(assignForm.baseId),
        equipmentTypeId: parseInt(assignForm.equipmentTypeId),
        quantity: parseInt(assignForm.quantity),
        assignedTo: assignForm.assignedTo,
        date: assignForm.date,
      });
      setToast({ type: 'success', message: 'Assignment recorded successfully!' });
      setShowForm(false);
      setAssignForm({ baseId: '', equipmentTypeId: '', quantity: '', assignedTo: '', date: new Date().toISOString().split('T')[0] });
      fetchData(1, filters);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create assignment' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenditures', {
        baseId: parseInt(expendForm.baseId),
        equipmentTypeId: parseInt(expendForm.equipmentTypeId),
        quantity: parseInt(expendForm.quantity),
        description: expendForm.description,
        date: expendForm.date,
      });
      setToast({ type: 'success', message: 'Expenditure recorded successfully!' });
      setShowForm(false);
      setExpendForm({ baseId: '', equipmentTypeId: '', quantity: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData(1, filters);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to record expenditure' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const assignmentColumns = [
    { key: 'id', label: 'ID', render: (row) => <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>#{row.id}</span> },
    { key: 'base', label: 'Base', render: (row) => <span style={{ fontWeight: 600 }}>{row.base?.name}</span> },
    {
      key: 'equipmentType', label: 'Equipment',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.equipmentType?.name}</div>
          <span className={`badge ${row.equipmentType?.category === 'WEAPON' ? 'badge-red' : row.equipmentType?.category === 'VEHICLE' ? 'badge-blue' : 'badge-amber'}`} style={{ marginTop: 4 }}>
            {row.equipmentType?.category}
          </span>
        </div>
      ),
    },
    { key: 'quantity', label: 'Qty', render: (row) => <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-amber)' }}>{row.quantity.toLocaleString()}</span> },
    { key: 'assignedTo', label: 'Assigned To', render: (row) => <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{row.assignedTo}</span> },
    { key: 'date', label: 'Date', render: (row) => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span> },
  ];

  const expenditureColumns = [
    { key: 'id', label: 'ID', render: (row) => <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>#{row.id}</span> },
    { key: 'base', label: 'Base', render: (row) => <span style={{ fontWeight: 600 }}>{row.base?.name}</span> },
    {
      key: 'equipmentType', label: 'Equipment',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.equipmentType?.name}</div>
          <span className={`badge ${row.equipmentType?.category === 'WEAPON' ? 'badge-red' : row.equipmentType?.category === 'VEHICLE' ? 'badge-blue' : 'badge-amber'}`} style={{ marginTop: 4 }}>
            {row.equipmentType?.category}
          </span>
        </div>
      ),
    },
    { key: 'quantity', label: 'Qty', render: (row) => <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-red)' }}>-{row.quantity.toLocaleString()}</span> },
    { key: 'description', label: 'Description', render: (row) => <span style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</span> },
    { key: 'date', label: 'Date', render: (row) => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span> },
  ];

  const tabs = [
    { key: 'assignments', label: 'Assignments', icon: Users, count: assignPagination?.total },
    { key: 'expenditures', label: 'Expenditures', icon: Flame, count: expendPagination?.total },
  ];

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={28} style={{ color: 'var(--accent-amber)' }} />
          <div>
            <h1 className="page-title">Assignments & Expenditures</h1>
            <p className="page-subtitle">Track equipment allocation and consumption</p>
          </div>
        </div>
        {hasRole('ADMIN', 'BASE_COMMANDER') && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            {activeTab === 'assignments' ? 'New Assignment' : 'Record Expenditure'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: 'rgba(26, 31, 53, 0.6)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px',
        width: 'fit-content',
        border: '1px solid var(--border-primary)',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === tab.key ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Icon size={15} />
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  padding: '1px 7px',
                  borderRadius: '100px',
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  fontSize: '11px',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      {activeTab === 'assignments' ? (
        <DataTable
          columns={assignmentColumns}
          data={assignments}
          pagination={assignPagination}
          onPageChange={(page) => fetchData(page, filters)}
          loading={loading}
        />
      ) : (
        <DataTable
          columns={expenditureColumns}
          data={expenditures}
          pagination={expendPagination}
          onPageChange={(page) => fetchData(page, filters)}
          loading={loading}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>
                {activeTab === 'assignments' ? 'New Assignment' : 'Record Expenditure'}
              </h2>
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

            {activeTab === 'assignments' ? (
              <form onSubmit={handleAssignSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
<<<<<<< HEAD
                  <label className="form-label">Base</label>
                  <select className="form-select" value={assignForm.baseId} onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })} required style={{ width: '100%' }}>
=======
                  <label htmlFor="assign-base" className="form-label">Base</label>
                  <select id="assign-base" className="form-select" value={assignForm.baseId} onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })} required style={{ width: '100%' }}>
>>>>>>> 17bb1ec (Initial commit / Update project)
                    <option value="">Select Base</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
<<<<<<< HEAD
                  <label className="form-label">Equipment Type</label>
                  <select className="form-select" value={assignForm.equipmentTypeId} onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })} required style={{ width: '100%' }}>
=======
                  <label htmlFor="assign-equipment-type" className="form-label">Equipment Type</label>
                  <select id="assign-equipment-type" className="form-select" value={assignForm.equipmentTypeId} onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })} required style={{ width: '100%' }}>
>>>>>>> 17bb1ec (Initial commit / Update project)
                    <option value="">Select Equipment</option>
                    {equipmentTypes.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
<<<<<<< HEAD
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" value={assignForm.quantity} onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })} placeholder="Enter quantity" min="1" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Assigned To</label>
                  <input type="text" className="form-input" value={assignForm.assignedTo} onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })} placeholder="e.g., Sgt. Mitchell, 3rd Platoon" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={assignForm.date} onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })} required style={{ width: '100%' }} />
=======
                  <label htmlFor="assign-quantity" className="form-label">Quantity</label>
                  <input id="assign-quantity" type="number" className="form-input" value={assignForm.quantity} onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })} placeholder="Enter quantity" min="1" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="assign-assigned-to" className="form-label">Assigned To</label>
                  <input id="assign-assigned-to" type="text" className="form-input" value={assignForm.assignedTo} onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })} placeholder="e.g., Sgt. Mitchell, 3rd Platoon" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="assign-date" className="form-label">Date</label>
                  <input id="assign-date" type="date" className="form-input" value={assignForm.date} onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })} required style={{ width: '100%' }} />
>>>>>>> 17bb1ec (Initial commit / Update project)
                </div>
                <button type="submit" className="btn btn-success" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Recording...</> : <><Users size={16} /> Record Assignment</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleExpendSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
<<<<<<< HEAD
                  <label className="form-label">Base</label>
                  <select className="form-select" value={expendForm.baseId} onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })} required style={{ width: '100%' }}>
=======
                  <label htmlFor="expend-base" className="form-label">Base</label>
                  <select id="expend-base" className="form-select" value={expendForm.baseId} onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })} required style={{ width: '100%' }}>
>>>>>>> 17bb1ec (Initial commit / Update project)
                    <option value="">Select Base</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
<<<<<<< HEAD
                  <label className="form-label">Equipment Type</label>
                  <select className="form-select" value={expendForm.equipmentTypeId} onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })} required style={{ width: '100%' }}>
=======
                  <label htmlFor="expend-equipment-type" className="form-label">Equipment Type</label>
                  <select id="expend-equipment-type" className="form-select" value={expendForm.equipmentTypeId} onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })} required style={{ width: '100%' }}>
>>>>>>> 17bb1ec (Initial commit / Update project)
                    <option value="">Select Equipment</option>
                    {equipmentTypes.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
<<<<<<< HEAD
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" value={expendForm.quantity} onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })} placeholder="Enter quantity consumed" min="1" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={expendForm.description} onChange={(e) => setExpendForm({ ...expendForm, description: e.target.value })} placeholder="e.g., Live-fire training exercise - Week 12" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={expendForm.date} onChange={(e) => setExpendForm({ ...expendForm, date: e.target.value })} required style={{ width: '100%' }} />
=======
                  <label htmlFor="expend-quantity" className="form-label">Quantity</label>
                  <input id="expend-quantity" type="number" className="form-input" value={expendForm.quantity} onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })} placeholder="Enter quantity consumed" min="1" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="expend-description" className="form-label">Description</label>
                  <textarea id="expend-description" className="form-input" value={expendForm.description} onChange={(e) => setExpendForm({ ...expendForm, description: e.target.value })} placeholder="e.g., Live-fire training exercise - Week 12" required style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="expend-date" className="form-label">Date</label>
                  <input id="expend-date" type="date" className="form-input" value={expendForm.date} onChange={(e) => setExpendForm({ ...expendForm, date: e.target.value })} required style={{ width: '100%' }} />
>>>>>>> 17bb1ec (Initial commit / Update project)
                </div>
                <button type="submit" className="btn btn-danger" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Recording...</> : <><Flame size={16} /> Record Expenditure</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
