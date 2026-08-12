import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick, trend }) => {
  const colors = {
    blue: {
      gradient: 'var(--gradient-blue)',
      glow: 'var(--accent-blue-glow)',
      border: 'rgba(59, 130, 246, 0.25)',
      text: 'var(--accent-blue)',
    },
    emerald: {
      gradient: 'var(--gradient-emerald)',
      glow: 'var(--accent-emerald-glow)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: 'var(--accent-emerald)',
    },
    amber: {
      gradient: 'var(--gradient-amber)',
      glow: 'var(--accent-amber-glow)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: 'var(--accent-amber)',
    },
    red: {
      gradient: 'var(--gradient-red)',
      glow: 'var(--accent-red-glow)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: 'var(--accent-red)',
    },
    purple: {
      gradient: 'var(--gradient-purple)',
      glow: 'var(--accent-purple-glow)',
      border: 'rgba(139, 92, 246, 0.25)',
      text: 'var(--accent-purple)',
    },
    cyan: {
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      glow: 'var(--accent-cyan-glow)',
      border: 'rgba(6, 182, 212, 0.25)',
      text: 'var(--accent-cyan)',
    },
  };

  const c = colors[color] || colors.blue;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(26, 31, 53, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 25px ${c.glow}`;
        e.currentTarget.style.borderColor = c.text;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = c.border;
      }}
    >
      {/* Background glow effect */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        background: c.gradient,
        borderRadius: '50%',
        opacity: 0.08,
        filter: 'blur(20px)',
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '14px',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </div>
        <div style={{
          width: 38,
          height: 38,
          background: c.glow,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${c.border}`,
        }}>
          <Icon size={18} style={{ color: c.text }} />
        </div>
      </div>

      <div style={{
        fontSize: '28px',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {(subtitle || trend) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          fontSize: '12px',
          color: trend === 'up' ? 'var(--accent-emerald)' : trend === 'down' ? 'var(--accent-red)' : 'var(--text-muted)',
        }}>
          {trend && <TrendIcon size={14} />}
          <span>{subtitle}</span>
        </div>
      )}

      {onClick && (
        <div style={{
          marginTop: '10px',
          fontSize: '11px',
          color: c.text,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          opacity: 0.8,
        }}>
          Click for details →
        </div>
      )}
    </div>
  );
};

export default StatCard;
