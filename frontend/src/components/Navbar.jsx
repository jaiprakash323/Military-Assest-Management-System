import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Crosshair } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      height: 'var(--navbar-height)',
      background: 'var(--bg-navbar)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 90,
      transition: 'left var(--transition-normal)',
    }}>
      {/* Left — Breadcrumb / Current Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Crosshair size={18} style={{ color: 'var(--accent-blue)', opacity: 0.7 }} />
        <span style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Military Asset Management System
        </span>
      </div>

      {/* Right — Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Base indicator */}
        <div style={{
          padding: '6px 14px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '100px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            animation: 'pulse 2s ease infinite',
          }} />
          {user?.baseName || 'All Bases'}
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notification Bell */}
        <button style={{
          position: 'relative',
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          border: '1px solid var(--border-primary)',
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
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--accent-red)',
          }} />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
