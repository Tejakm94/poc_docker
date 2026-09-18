import { useState, useEffect } from 'react';
import type { Toast, SortConfig, SortDirection } from '../types';

export function highlightMatch(value: unknown, search: string): React.ReactNode {
  const text = String(value ?? '');
  const query = search.trim();
  const matchStart = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (matchStart === -1) return text;

  const matchEnd = matchStart + query.length;
  return <>{text.slice(0, matchStart)}<mark style={{ background: 'rgb(255 225 15)', color: 'inherit', borderRadius: 2, padding: '0 1px' }}>{text.slice(matchStart, matchEnd)}</mark>{text.slice(matchEnd)}</>;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'navy';
export function Badge({ variant = 'neutral', children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  const styles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    success: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    warning: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    error:   { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
    info:    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    neutral: { bg: 'var(--slate-100)', color: 'var(--slate-600)', border: 'var(--slate-300)' },
    navy:    { bg: 'var(--navy-800)', color: '#fff', border: 'var(--navy-700)' },
  };
  const s = styles[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 3,
      fontSize: 11, fontWeight: 500, letterSpacing: 0.2,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';
interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}
export function Button({ variant = 'secondary', size = 'md', disabled, onClick, children, type = 'button', style }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: '1px solid transparent', borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontWeight: 500, fontFamily: 'inherit',
    transition: 'all 0.15s',
  };
  const sizes = {
    sm: { padding: '4px 10px', fontSize: 12 },
    md: { padding: '6px 14px', fontSize: 12.5 },
  };
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary:   { background: 'var(--navy-700)', color: '#fff', borderColor: 'var(--navy-700)' },
    secondary: { background: '#fff', color: 'var(--text-primary)', borderColor: 'var(--border-strong)' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', borderColor: 'transparent' },
    danger:    { background: '#fff', color: 'var(--accent-red)', borderColor: '#fecaca' },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  type?: string;
  rows?: number;
}
export function FormField({ label, value, onChange, placeholder, required, readOnly, error, type = 'text', rows }: InputProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 10px',
    border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-strong)'}`,
    borderRadius: 'var(--radius-md)', fontSize: 12.5,
    background: readOnly ? 'var(--slate-50)' : '#fff',
    color: readOnly ? 'var(--text-muted)' : 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: 0.1 }}>
          {label}{required && <span style={{ color: 'var(--accent-red)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          readOnly={readOnly} rows={rows} style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} readOnly={readOnly} style={inputStyle} />
      )}
      {error && <span style={{ fontSize: 11, color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, required, readOnly, error }: {
  label?: string; value: string | number; onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  required?: boolean; readOnly?: boolean; error?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: 0.1 }}>
          {label}{required && <span style={{ color: 'var(--accent-red)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select value={value} onChange={e => onChange(e.target.value)} disabled={readOnly}
        style={{
          width: '100%', padding: '6px 10px',
          border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)', fontSize: 12.5,
          background: readOnly ? 'var(--slate-50)' : '#fff',
          outline: 'none', fontFamily: 'inherit',
        }}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize: 11, color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}
export function Modal({ open, title, onClose, children, footer, width = 560 }: ModalProps) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 6,
        width: '100%', maxWidth: width,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
export function ConfirmDelete({ open, name, onConfirm, onCancel }: {
  open: boolean; name: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} title="Confirm Delete" onClose={onCancel} width={420}
      footer={<>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          padding: '10px 14px', background: '#fef2f2',
          border: '1px solid #fecaca', borderRadius: 4, fontSize: 12.5,
        }}>
          ⚠ This action cannot be undone.
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Are you sure you want to delete <strong>"{name}"</strong>? All associated records may be affected.
        </p>
      </div>
    </Modal>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-enter" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 4, minWidth: 280,
          background: t.type === 'success' ? '#f0fdf4' : t.type === 'error' ? '#fef2f2' : t.type === 'warning' ? '#fffbeb' : '#eff6ff',
          border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : t.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: t.type === 'success' ? '#15803d' : t.type === 'error' ? '#b91c1c' : t.type === 'warning' ? '#b45309' : '#1d4ed8',
          fontSize: 12.5, fontWeight: 500,
        }}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 14 }}>×</button>
        </div>
      ))}
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, addToast, removeToast };
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ total, page, pageSize, onPage, onPageSize }: {
  total: number; page: number; pageSize: number;
  onPage: (p: number) => void; onPageSize: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px', borderTop: '1px solid var(--border)',
      background: '#fff', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-secondary)' }}>
        Showing {start}–{end} of {total} records
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 3, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 12 }}>‹</button>
        {pages.map((p, i) => p === '...' ? (
          <span key={`e${i}`} style={{ padding: '4px 6px', color: 'var(--text-muted)' }}>…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            style={{
              padding: '4px 8px', border: '1px solid', borderRadius: 3, cursor: 'pointer', fontSize: 12, minWidth: 28,
              background: p === page ? 'var(--navy-700)' : '#fff',
              color: p === page ? '#fff' : 'var(--text-primary)',
              borderColor: p === page ? 'var(--navy-700)' : 'var(--border)',
            }}>{p}</button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 3, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: 12 }}>›</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
        Rows per page:
        <select value={pageSize} onChange={e => onPageSize(Number(e.target.value))} style={{
          border: '1px solid var(--border)', borderRadius: 3, padding: '3px 6px', fontSize: 12, background: '#fff',
        }}>
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string; onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: 0 }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12.5, fontWeight: tab.id === active ? 600 : 400,
          color: tab.id === active ? 'var(--navy-700)' : 'var(--text-secondary)',
          borderBottom: `2px solid ${tab.id === active ? 'var(--navy-600)' : 'transparent'}`,
          marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              background: tab.id === active ? 'var(--navy-700)' : 'var(--slate-200)',
              color: tab.id === active ? '#fff' : 'var(--text-secondary)',
              borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 600,
            }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '20px 0' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600,
              background: i < current ? 'var(--navy-700)' : i === current ? 'var(--navy-600)' : 'var(--slate-200)',
              color: i <= current ? '#fff' : 'var(--text-muted)',
              border: i === current ? '2px solid var(--navy-400)' : '2px solid transparent',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: 11, fontWeight: i === current ? 600 : 400,
              color: i === current ? 'var(--navy-700)' : i < current ? 'var(--text-secondary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 12px', marginBottom: 18,
              background: i < current ? 'var(--navy-600)' : 'var(--slate-200)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: '16px 24px', background: '#fff', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}

// ─── Sort header helper ───────────────────────────────────────────────────────
export function useSortTable(defaultKey: string) {
  const [sort, setSort] = useState<SortConfig>({ key: defaultKey, direction: 'asc' });
  const toggleSort = (key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: 4, opacity: sort.key === col ? 1 : 0.3, fontSize: 10 }}>
      {sort.key === col ? (sort.direction === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );
  return { sort, toggleSort, SortIcon };
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
export function LoadingRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map(i => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ padding: '10px 12px' }}>
              <div style={{
                height: 12, borderRadius: 3,
                background: 'var(--slate-200)',
                width: `${60 + Math.random() * 30}%`,
                animation: 'pulse 1.5s ease infinite',
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⬚</div>
      <div style={{ fontSize: 13, marginBottom: 12 }}>{message}</div>
      {action}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
export function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 4,
      overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none',
      }}>⌕</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search...'}
        style={{
          padding: '6px 10px 6px 28px',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          fontSize: 12.5, outline: 'none',
          background: '#fff', width: 240,
        }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14,
        }}>×</button>
      )}
    </div>
  );
}
