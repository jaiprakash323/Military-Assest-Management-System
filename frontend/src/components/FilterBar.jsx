import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Filter, X } from 'lucide-react';

const FilterBar = ({ onFilterChange, showBaseFilter = true, showEquipmentFilter = true, showDateFilter = true }) => {
  const { isAdmin } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    baseId: '',
    equipmentTypeId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [basesRes, equipRes] = await Promise.all([
          api.get('/assets/bases'),
          api.get('/assets/equipment-types'),
        ]);
        setBases(basesRes.data);
        setEquipmentTypes(equipRes.data);
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    fetchFilterData();
  }, []);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = { baseId: '', equipmentTypeId: '', startDate: '', endDate: '' };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  // Group equipment types by category
  const groupedEquipment = equipmentTypes.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      padding: '16px 20px',
      background: 'rgba(26, 31, 53, 0.5)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        <Filter size={14} />
        Filters
      </div>

      {showBaseFilter && isAdmin() && (
        <select
          className="form-select"
          value={filters.baseId}
          onChange={(e) => handleChange('baseId', e.target.value)}
          style={{ minWidth: '160px', fontSize: '13px', padding: '8px 32px 8px 12px' }}
        >
          <option value="">All Bases</option>
          {bases.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      )}

      {showEquipmentFilter && (
        <select
          className="form-select"
          value={filters.equipmentTypeId}
          onChange={(e) => handleChange('equipmentTypeId', e.target.value)}
          style={{ minWidth: '180px', fontSize: '13px', padding: '8px 32px 8px 12px' }}
        >
          <option value="">All Equipment</option>
          {Object.entries(groupedEquipment).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      )}

      {showDateFilter && (
        <>
          <input
            type="date"
            className="form-input"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            style={{ fontSize: '13px', padding: '8px 12px' }}
            placeholder="Start Date"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
          <input
            type="date"
            className="form-input"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            style={{ fontSize: '13px', padding: '8px 12px' }}
            placeholder="End Date"
          />
        </>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-red)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
