import { useState } from 'react';
import { Button, PageHeader, SectionCard, Badge, Stepper, useToasts, ToastContainer } from '../components/UI';
import { remoteTerminals, messages, words, elements, busList } from '../mockData';

const STEPS = ['Select Data', 'Configure', 'Validate', 'Generate', 'Success'];

interface ValidationResult {
  category: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  count?: number;
}

const validationResults: ValidationResult[] = [
  { category: 'Remote Terminals', status: 'pass', message: `${remoteTerminals.length} records validated`, count: remoteTerminals.length },
  { category: 'Messages', status: 'pass', message: `${messages.length} records validated`, count: messages.length },
  { category: 'Words', status: 'pass', message: `${words.length} records validated`, count: words.length },
  { category: 'Elements', status: 'pass', message: `${elements.length} records validated`, count: elements.length },
  { category: 'Bus References', status: 'pass', message: 'All BusId references resolved', count: busList.length },
  { category: 'ICD Version Consistency', status: 'warning', message: '2 RTs have different ICD versions — verify intentional', count: 2 },
  { category: 'RT Address Uniqueness', status: 'pass', message: 'All RT addresses unique per bus' },
  { category: 'Orphaned Words', status: 'warning', message: '0 words without parent messages' },
  { category: 'MIL-STD-1553 Compliance', status: 'pass', message: 'RT addresses within valid range (1–30)' },
];

export default function MDBGenerationPage() {
  const [step, setStep] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [selected, setSelected] = useState({
    remoteTerminals: true, messages: true, words: true, elements: true,
    buses: true, messageTypes: true,
  });
  const [config, setConfig] = useState({
    outputName: `ADA_v4.1_${new Date().toISOString().slice(0, 10)}`,
    mdbVersion: '2007-2016',
    includeSystemFields: false,
    compactOnClose: true,
    password: '',
    description: 'ADA Interface Control Database',
  });
  const { toasts, addToast, removeToast } = useToasts();

  const errorCount = validationResults.filter(r => r.status === 'error').length;
  const warningCount = validationResults.filter(r => r.status === 'warning').length;

  const handleGenerate = () => {
    setStep(3);
    setGenProgress(0);
    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => setStep(4), 500); return 100; }
        return prev + Math.random() * 12;
      });
    }, 200);
  };

  const reset = () => { setStep(0); setGenProgress(0); };

  const totalRecords = Object.entries(selected).filter(([k, v]) => v && !['buses', 'messageTypes'].includes(k)).length;

  const dataSources = [
    { key: 'remoteTerminals', label: 'Remote Terminals', count: remoteTerminals.length, table: 'dbo.RemoteTerminal' },
    { key: 'messages', label: 'Messages', count: messages.length, table: 'dbo.Message' },
    { key: 'words', label: 'Words', count: words.length, table: 'dbo.Word' },
    { key: 'elements', label: 'Elements', count: elements.length, table: 'dbo.Element' },
    { key: 'buses', label: 'Bus List (Lookup)', count: busList.length, table: 'dbo.BusList' },
    { key: 'messageTypes', label: 'Message Types (Lookup)', count: 5, table: 'dbo.MessageType' },
  ];

  return (
    <div>
      <PageHeader title="MDB Generation" subtitle="Generate Microsoft Access MDB file from ADA database" />
      <div style={{ padding: '0 24px' }}>
        <Stepper steps={STEPS} current={step} />
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {/* Step 0: Select Data */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
            <SectionCard>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Select Data Sources</span>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dataSources.map(src => (
                  <label key={src.key} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 4, cursor: 'pointer',
                    border: `1px solid ${(selected as any)[src.key] ? 'var(--navy-400)' : 'var(--border)'}`,
                    background: (selected as any)[src.key] ? '#eff6ff' : '#fff',
                  }}>
                    <input type="checkbox" checked={(selected as any)[src.key]}
                      onChange={e => setSelected(s => ({ ...s, [src.key]: e.target.checked }))} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{src.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{src.table}</div>
                    </div>
                    <Badge variant={(selected as any)[src.key] ? 'info' : 'neutral'}>
                      {src.count} records
                    </Badge>
                  </label>
                ))}
              </div>
            </SectionCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SectionCard style={{ padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>Selection Summary</div>
                {dataSources.map(src => (
                  <div key={src.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: (selected as any)[src.key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {(selected as any)[src.key] ? '✓' : '○'} {src.label}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: (selected as any)[src.key] ? 'var(--navy-700)' : 'var(--text-muted)' }}>
                      {(selected as any)[src.key] ? src.count : '—'}
                    </span>
                  </div>
                ))}
              </SectionCard>
              <Button variant="primary" onClick={() => setStep(1)}>Next: Configure →</Button>
            </div>
          </div>
        )}

        {/* Step 1: Configure */}
        {step === 1 && (
          <div style={{ maxWidth: 600 }}>
            <SectionCard>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>MDB Configuration</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Output Filename <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <input value={config.outputName} onChange={e => setConfig(c => ({ ...c, outputName: e.target.value }))}
                      style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: '4px 0 0 4px', fontSize: 12.5, outline: 'none', fontFamily: 'JetBrains Mono, monospace' }} />
                    <span style={{ padding: '6px 10px', background: 'var(--slate-100)', border: '1px solid var(--border-strong)', borderLeft: 'none', borderRadius: '0 4px 4px 0', fontSize: 12, color: 'var(--text-muted)' }}>.mdb</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea value={config.description} onChange={e => setConfig(c => ({ ...c, description: e.target.value }))} rows={2}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12.5, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>MDB Format Version</label>
                  <select value={config.mdbVersion} onChange={e => setConfig(c => ({ ...c, mdbVersion: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12.5, background: '#fff', outline: 'none' }}>
                    <option value="2000">Access 2000 (MDB 4.0)</option>
                    <option value="2002-2003">Access 2002–2003 (MDB 9.0)</option>
                    <option value="2007-2016">Access 2007–2016 (ACCDB compatible)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'includeSystemFields', label: 'Include system fields (Id, CreatedAt, CreatedBy, UpdatedBy)' },
                    { key: 'compactOnClose', label: 'Compact database on generation' },
                  ].map(opt => (
                    <label key={opt.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', fontSize: 12.5 }}>
                      <input type="checkbox" checked={(config as any)[opt.key]}
                        onChange={e => setConfig(c => ({ ...c, [opt.key]: e.target.checked }))} style={{ marginTop: 2 }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Database Password (optional)</label>
                  <input type="password" value={config.password} onChange={e => setConfig(c => ({ ...c, password: e.target.value }))}
                    placeholder="Leave blank for no password"
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12.5, outline: 'none' }} />
                </div>
              </div>
            </SectionCard>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
              <Button variant="primary" onClick={() => setStep(2)}>Next: Validate →</Button>
            </div>
          </div>
        )}

        {/* Step 2: Validate */}
        {step === 2 && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>{validationResults.filter(r => r.status === 'pass').length}</div>
                <div style={{ fontSize: 11.5, color: '#15803d' }}>Checks passed</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#b45309' }}>{warningCount}</div>
                <div style={{ fontSize: 11.5, color: '#b45309' }}>Warnings</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#b91c1c' }}>{errorCount}</div>
                <div style={{ fontSize: 11.5, color: '#b91c1c' }}>Errors</div>
              </div>
            </div>

            <SectionCard>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Validation Results</span>
              </div>
              <div>
                {validationResults.map((r, i) => (
                  <div key={i} style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: r.status === 'error' ? '#fef2f2' : r.status === 'warning' ? '#fffbeb' : '#fff',
                  }}>
                    <Badge variant={r.status === 'pass' ? 'success' : r.status === 'warning' ? 'warning' : 'error'}>
                      {r.status === 'pass' ? '✓ Pass' : r.status === 'warning' ? '⚠ Warn' : '✕ Error'}
                    </Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.category}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{r.message}</div>
                    </div>
                    {r.count !== undefined && (
                      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{r.count}</span>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
              <Button variant="primary" disabled={errorCount > 0} onClick={handleGenerate}>
                {errorCount > 0 ? 'Resolve errors first' : 'Generate MDB →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 3 && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <SectionCard style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⬛</div>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Generating MDB File</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
                {config.outputName}.mdb · {config.mdbVersion}
              </p>
              <div style={{ background: 'var(--slate-200)', borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 4, background: 'var(--navy-600)', width: `${Math.min(genProgress, 100)}%`, transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(Math.min(genProgress, 100))}%</span>
              <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--text-muted)' }}>
                {genProgress < 20 ? 'Creating Access database structure...' :
                 genProgress < 45 ? 'Writing Remote Terminal records...' :
                 genProgress < 65 ? 'Writing Message records...' :
                 genProgress < 80 ? 'Writing Word and Element records...' :
                 genProgress < 95 ? 'Building relationships and indexes...' :
                 'Compacting database...'}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <SectionCard style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>MDB Generated Successfully</h2>
              <div style={{ fontSize: 14, fontFamily: 'JetBrains Mono, monospace', color: 'var(--navy-700)', marginBottom: 4 }}>
                {config.outputName}.mdb
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Format: Access {config.mdbVersion} · {(remoteTerminals.length * 0.05 + messages.length * 0.03 + words.length * 0.01 + 0.8).toFixed(1)} MB
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {[
                  ['RTs', remoteTerminals.length],
                  ['Messages', messages.length],
                  ['Words', words.length],
                  ['Elements', elements.length],
                ].map(([l, v]) => (
                  <div key={l as string} style={{ padding: '10px', background: 'var(--slate-50)', borderRadius: 4, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy-700)' }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button variant="primary" onClick={() => addToast('success', `${config.outputName}.mdb download started`)}>⬇ Download MDB</Button>
                <Button variant="secondary" onClick={reset}>Generate Another</Button>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
