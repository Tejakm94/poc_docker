import { useState } from 'react';
import type { NavPage } from '../types';

interface SidebarItem {
  id: NavPage;
  label: string;
  icon: string;
  group?: string;
}

const navItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣', group: 'MAIN' },
  { id: 'remote-terminal', label: 'Remote Terminal', icon: '⬡', group: 'DATA MAINTENANCE' },
  { id: 'message', label: 'Message', icon: '◫', group: 'DATA MAINTENANCE' },
  { id: 'word', label: 'Word', icon: '◨', group: 'DATA MAINTENANCE' },
  { id: 'element', label: 'Element', icon: '◩', group: 'DATA MAINTENANCE' },
  { id: 'pdf-import', label: 'PDF Import', icon: '⊞', group: 'REPORTS' },
  { id: 'mdb-generation', label: 'MDB Generation', icon: '⬛', group: 'REPORTS' },
  { id: 'db-generation', label: 'DB Generation', icon: 'DB', group: 'DATABASE' },
];

const pageLabels: Record<NavPage, string> = {
  'dashboard': 'Dashboard',
  'remote-terminal': 'Remote Terminal Maintenance',
  'message': 'Message Maintenance',
  'word': 'Word Maintenance',
  'element': 'Element Maintenance',
  'lookup': 'Lookup / Reference Data',
  'pdf-report': 'PDF Report',
  'pdf-import': 'PDF Import',
  'mdb-generation': 'MDB Generation',
  'db-generation': 'DB Generation',
};

interface Props {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const breadcrumb = currentPage === 'dashboard'
    ? ['Dashboard']
    : ['Home', pageLabels[currentPage]];

  let groups: string[] = [];
  const sidebarItems = navItems.filter(item => item.id !== 'mdb-generation');
  sidebarItems.forEach(item => {
    if (item.group && !groups.includes(item.group)) groups.push(item.group);
  });

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--surface-alt)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 56 : 248,
        minWidth: collapsed ? 56 : 248,
        background: 'var(--navy-950)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 4,
            background: 'var(--navy-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: -0.5,
          }}>A</div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 12.5, letterSpacing: 0.2 }}>ADA DMS</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 0.3 }}>DATABASE MANAGEMENT</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {groups.map(group => (
            <div key={group}>
              {!collapsed && (
                <div style={{
                  padding: '14px 16px 4px',
                  color: 'rgba(255,255,255,0.28)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}>
                  {group}
                </div>
              )}
              {sidebarItems.filter(i => i.group === group).map(item => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '8px 0' : '7px 16px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none',
                      borderLeft: active ? '3px solid var(--navy-400)' : '3px solid transparent',
                      cursor: 'pointer',
                      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                      fontSize: 12.5,
                      fontWeight: active ? 500 : 400,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '12px',
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            fontSize: 14,
          }}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 52,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          flexShrink: 0,
          zIndex: 30,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12.5 }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
                <span style={{
                  color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                }}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>

          {/* Global Search */}
          <div style={{ position: 'relative' }}>
            {searchOpen ? (
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onBlur={() => { setSearchOpen(false); setSearchVal(''); }}
                placeholder="Search across all data..."
                style={{
                  width: 280,
                  padding: '5px 10px 5px 30px',
                  border: '1px solid var(--navy-500)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  outline: 'none',
                  background: '#fff',
                }}
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-alt)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                }}
              >
                <span>⌕</span>
                <span>Search...</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>⌘K</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          
          {/* User */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            padding: '4px 8px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'transparent',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--navy-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 600,
            }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Admin</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Admin</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
