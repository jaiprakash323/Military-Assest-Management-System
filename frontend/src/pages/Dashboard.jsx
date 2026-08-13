import { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import NetMoveModal from '../components/NetMoveModal';
import FilterBar from '../components/FilterBar';
import {
  Package,
  TrendingUp,
  Users,
  Archive,
  Activity,
  Crosshair,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showNetModal, setShowNetModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchData = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filterParams.baseId) params.baseId = filterParams.baseId;
      if (filterParams.equipmentTypeId) params.equipmentTypeId = filterParams.equipmentTypeId;
      if (filterParams.startDate) params.startDate = filterParams.startDate;
      if (filterParams.endDate) params.endDate = filterParams.endDate;

      const [metricsRes, chartRes] = await Promise.all([
        api.get('/assets/dashboard', { params }),
        api.get('/assets/chart-data', { params }),
      ]);
      setMetrics(metricsRes.data);
      setChartData(chartRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              marginBottom: '4px',
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: entry.color,
              }} />
              <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !metrics) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Command Center Overview</p>
        </div>
        <div className="grid grid-4" style={{ gap: '16px', marginBottom: '24px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 350, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Crosshair size={28} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Real-time asset tracking & operational intelligence</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ gap: '16px', marginBottom: '28px' }}>
        <StatCard
          title="Opening Balance"
          value={metrics?.openingBalance || 0}
          icon={Package}
          color="blue"
          subtitle="Period start inventory"
        />
        <StatCard
          title="Net Movement"
          value={metrics?.netMovement || 0}
          icon={TrendingUp}
          color="emerald"
          subtitle="Purchases + Transfers net"
          onClick={() => setShowNetModal(true)}
          trend={metrics?.netMovement > 0 ? 'up' : metrics?.netMovement < 0 ? 'down' : null}
        />
        <StatCard
          title="Assigned + Expended"
          value={(metrics?.assigned || 0) + (metrics?.expended || 0)}
          icon={Users}
          color="amber"
          subtitle={`${metrics?.assigned || 0} assigned · ${metrics?.expended || 0} expended`}
        />
        <StatCard
          title="Closing Balance"
          value={metrics?.closingBalance || 0}
          icon={Archive}
          color={metrics?.closingBalance >= 0 ? 'cyan' : 'red'}
          subtitle="Current available stock"
          trend={metrics?.closingBalance > 0 ? 'up' : metrics?.closingBalance < 0 ? 'down' : null}
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts-grid">
        {/* Bar Chart - Movements by Month */}
        <div style={{
          background: 'rgba(26, 31, 53, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Activity size={16} style={{ color: 'var(--accent-blue)' }} />
              Monthly Asset Movements
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Purchases and transfers over the last 6 months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              />
              <Bar dataKey="purchases" name="Purchases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transfersIn" name="Transfers In" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transfersOut" name="Transfers Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart - Expenditure Trend */}
        <div style={{
          background: 'rgba(26, 31, 53, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <TrendingUp size={16} style={{ color: 'var(--accent-amber)' }} />
              Expenditure Trend
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Assets consumed over the last 6 months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="expendedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="expended"
                name="Expended"
                stroke="#f59e0b"
                fill="url(#expendedGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Movement Modal */}
      {showNetModal && (
        <NetMoveModal
          metrics={metrics}
          onClose={() => setShowNetModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
