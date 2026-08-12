import { X, ShoppingCart, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const NetMoveModal = ({ metrics, onClose }) => {
  if (!metrics) return null;

  const items = [
    {
      label: 'Purchases',
      value: metrics.purchases,
      icon: ShoppingCart,
      color: 'var(--accent-blue)',
      bgColor: 'var(--accent-blue-glow)',
      sign: '+',
    },
    {
      label: 'Transfers In',
      value: metrics.transfersIn,
      icon: ArrowDownLeft,
      color: 'var(--accent-emerald)',
      bgColor: 'var(--accent-emerald-glow)',
      sign: '+',
    },
    {
      label: 'Transfers Out',
      value: metrics.transfersOut,
      icon: ArrowUpRight,
      color: 'var(--accent-red)',
      bgColor: 'var(--accent-red-glow)',
      sign: '-',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              Net Movement Breakdown
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}>
              Detailed stock movement analysis
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-red)';
              e.currentTarget.style.color = 'var(--accent-red)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Breakdown Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: item.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {item.sign === '+' ? 'Incoming' : 'Outgoing'}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: item.color,
                }}>
                  {item.sign}{(item.value || 0).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'var(--border-primary)',
          margin: '18px 0',
        }} />

        {/* Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: 'rgba(59, 130, 246, 0.06)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Total Net Movement
          </span>
          <span style={{
            fontSize: '22px',
            fontWeight: 800,
            color: metrics.netMovement >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)',
          }}>
            {metrics.netMovement >= 0 ? '+' : ''}{(metrics.netMovement || 0).toLocaleString()}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '18px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NetMoveModal;
