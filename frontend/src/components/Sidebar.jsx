import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
  Users,
  ScrollText,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
    {
      label: 'Purchases',
      path: '/purchases',
      icon: ShoppingCart,
      roles: ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'],
    },
    {
      label: 'Transfers',
      path: '/transfers',
      icon: ArrowRightLeft,
      roles: ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'],
    },
    {
      label: 'Assignments',
      path: '/assignments',
      icon: Users,
      roles: ['ADMIN', 'BASE_COMMANDER'],
    },
    {
      label: 'Audit Log',
      path: '/audit-log',
      icon: ScrollText,
      roles: ['ADMIN'],
    },
  ];

  const filteredItems = navItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'ADMIN': return { label: 'Admin', className: 'badge badge-red' };
      case 'BASE_COMMANDER': return { label: 'Commander', className: 'badge badge-amber' };
      case 'LOGISTICS_OFFICER': return { label: 'Logistics', className: 'badge badge-blue' };
      default: return { label: 'User', className: 'badge badge-purple' };
    }
  };

  const roleBadge = getRoleBadge();
  const effectiveCollapsed = isMobile ? false : collapsed;

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: effectiveCollapsed ? '72px' : 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-primary)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform var(--transition-normal), width var(--transition-normal)',
      zIndex: 100,
      overflow: 'hidden',
      transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      boxShadow: isMobile && mobileOpen ? 'var(--shadow-lg)' : 'none',
    }}>
      {/* Logo Area */}
      <div style={{
        padding: effectiveCollapsed ? '20px 12px' : '20px 20px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: 'var(--navbar-height)',
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'var(--gradient-blue)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Shield size={20} color="white" />
        </div>
        {!effectiveCollapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}>
              MIL-ASSETS
            </div>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Command Center
            </div>
          </div>
        )}

        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobile && onClose) onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: effectiveCollapsed ? '12px' : '11px 14px',
                marginBottom: '4px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-blue-glow)' : 'transparent',
                transition: 'all var(--transition-fast)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: '60%',
                  background: 'var(--accent-blue)',
                  borderRadius: '0 3px 3px 0',
                }} />
              )}
              <Icon size={19} />
              {!effectiveCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Collapse Toggle */}
      <div style={{
        padding: effectiveCollapsed ? '16px 8px' : '16px',
        borderTop: '1px solid var(--border-primary)',
      }}>
        {!effectiveCollapsed && (
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--gradient-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user?.username}
                </div>
                <span className={roleBadge.className} style={{ marginTop: 2 }}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle collapse"
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-blue)';
              e.currentTarget.style.color = 'var(--accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

