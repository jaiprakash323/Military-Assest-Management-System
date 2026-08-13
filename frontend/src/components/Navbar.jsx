import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Crosshair, Menu } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className="navbar-container"
      style={{
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
        padding: '0 20px',
        zIndex: 90,
        transition: 'left var(--transition-normal)',
      }}
    >
      {/* Left — Breadcrumb / Hamburger Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onToggleMobile}
          className="mobile-only"
          aria-label="Toggle navigation drawer"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            padding: '6px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={18} />
        </button>

        <Crosshair size={18} style={{ color: 'var(--accent-blue)', opacity: 0.8, flexShrink: 0 }} />
        <span
          className="desktop-only"
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Military Asset Management System
        </span>
        <span
          className="mobile-only"
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          MIL-ASSETS
        </span>
      </div>

      {/* Right — Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Base indicator */}
        <div style={{
          padding: '4px 10px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            animation: 'pulse 2s ease infinite',
          }} />
          <span>{user?.baseName || 'All Bases'}</span>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          style={{
            position: 'relative',
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
            flexShrink: 0,
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
          <Bell size={15} />
          <span style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-red)',
          }} />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px', padding: '6px 10px' }}
          title="Logout"
        >
          <LogOut size={14} />
          <span className="desktop-only">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

