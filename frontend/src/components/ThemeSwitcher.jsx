import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Sparkles } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Background Theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          boxShadow: isOpen ? 'var(--shadow-glow-blue)' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-blue)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'var(--border-primary)';
        }}
      >
        <Palette size={16} style={{ color: 'var(--accent-blue)' }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: currentTheme.accentPreview,
              display: 'inline-block',
              boxShadow: `0 0 6px ${currentTheme.accentPreview}`,
            }}
          />
          {currentTheme.name}
        </span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            backdropFilter: 'blur(16px)',
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px 10px 8px',
              borderBottom: '1px solid var(--border-primary)',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={12} style={{ color: 'var(--accent-amber)' }} />
              Background Theme
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-accent)' }}>
              {themes.length} Presets
            </span>
          </div>

          {/* Theme Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {themes.map((t) => {
              const isSelected = t.id === theme;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                    border: isSelected
                      ? '1px solid var(--border-active)'
                      : '1px solid transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Swatch */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 'var(--radius-sm)',
                        background: t.bgPreview,
                        border: `2px solid ${t.accentPreview}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 8px ${t.accentPreview}40`,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '2px',
                          background: t.cardPreview,
                        }}
                      />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected
                            ? 'var(--text-accent)'
                            : 'var(--text-primary)',
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {t.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
