import { Badge } from '../components/UI';
import { remoteTerminals, messages, words, elements, busList, messageTypes, recentActivity } from '../mockData';
import type { NavPage } from '../types';

interface Props {
  onNavigate: (page: NavPage) => void;
}

const summaryCards = [
  { label: 'Remote Terminals', count: 12, page: 'remote-terminal' as NavPage, icon: '⬡', delta: '+1 this month', color: 'var(--navy-700)' },
  { label: 'Messages', count: 48, page: 'message' as NavPage, icon: '◫', delta: '+3 this month', color: '#0369a1' },
  { label: 'Words', count: 184, page: 'word' as NavPage, icon: '◨', delta: '+12 this month', color: '#0f766e' },
  { label: 'Elements', count: 621, page: 'element' as NavPage, icon: '◩', delta: '+28 this month', color: '#7c3aed' },
  { label: 'Lookup Entries', count: busList.length + messageTypes.length, page: 'lookup' as NavPage, icon: '◎', delta: 'Stable', color: '#b45309' },
  { label: 'PDF Imports', count: 7, page: 'pdf-import' as NavPage, icon: '⊞', delta: '+1 this week', color: '#be185d' },
  { label: 'Reports Generated', count: 23, page: 'pdf-report' as NavPage, icon: '⊟', delta: '+2 this week', color: '#15803d' },
  { label: 'MDB Exports', count: 5, page: 'mdb-generation' as NavPage, icon: '⬛', delta: 'Latest: R4.1', color: '#6b21a8' },
];

const actionVariant = (action: string) => {
  if (action === 'Added') return 'success';
  if (action === 'Modified') return 'info';
  if (action === 'Deleted') return 'error';
  if (action === 'Generated' || action === 'Imported') return 'navy';
  return 'neutral';
};

export default function Dashboard({ onNavigate }: Props) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>System Overview</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
             ADA Database
          </p>
        </div>
        {/* <div style={{ display: 'flex', gap: 8 }}>
          <Badge variant="success">● Connected</Badge>
          <Badge variant="neutral">ICD v3.2</Badge>
        </div> */}
      </div>

      {/* Summary grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {summaryCards.map(card => (
          <button key={card.page} onClick={() => onNavigate(card.page)} style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 4,
            padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 10,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--navy-400)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                width: 32, height: 32, borderRadius: 4,
                background: card.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>{card.icon}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{card.count}</span>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{card.delta}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Recent activity */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Recent Activity</h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 30 days</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                {['Action', 'Entity', 'Name', 'User', 'Timestamp'].map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--slate-50)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <Badge variant={actionVariant(row.action) as any}>{row.action}</Badge>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{row.entity}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{row.user}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Quick Actions</h2>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Add Remote Terminal', icon: '⬡', page: 'remote-terminal' as NavPage, color: 'var(--navy-700)' },
              { label: 'Add Message', icon: '◫', page: 'message' as NavPage, color: '#0369a1' },
              { label: 'Import PDF', icon: '⊞', page: 'pdf-import' as NavPage, color: '#be185d' },
              { label: 'Generate Report', icon: '⊟', page: 'message' as NavPage, color: '#15803d' },
              { label: 'Generate MDB', icon: '⬛', page: 'mdb-generation' as NavPage, color: '#6b21a8' },
            ].map(action => (
              <button key={action.page} onClick={() => onNavigate(action.page)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 4,
                border: '1px solid var(--border)',
                background: '#fff', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 500,
                color: 'var(--text-primary)',
                textAlign: 'left',
              }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 4,
                  background: action.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>

          {/* System info */}
          <div style={{ margin: '0 12px 12px', padding: 12, background: 'var(--slate-50)', borderRadius: 4, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Database</div>
            {[
              ['Server', 'localhost\\ADA_SQL2019'],
              ['Database', 'Ada'],
              ['Version', 'SQL Server 2019'],
              ['Backup', 'Ada.bak'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
