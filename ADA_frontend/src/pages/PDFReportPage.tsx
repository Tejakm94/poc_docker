import { useState } from 'react';
import { Button, PageHeader, SectionCard, Badge, useToasts, ToastContainer } from '../components/UI';
import { remoteTerminals, busList } from '../mockData';

type Step = 'criteria' | 'preview' | 'generating' | 'done';

export default function PDFReportPage() {
  const [step, setStep] = useState<Step>('criteria');
  const [progress, setProgress] = useState(0);
  const [filters, setFilters] = useState({
    reportType: 'full',
    lruFilter: '',
    busFilter: '',
    icdVersion: '',
    includeMessages: true,
    includeWords: true,
    includeElements: false,
    format: 'A4',
  });
  const { toasts, addToast, removeToast } = useToasts();

  const handleGenerate = () => {
    setStep('generating');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('done');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const reportTypes = [
    { value: 'full', label: 'Full ICD Report', desc: 'Complete interface control document with all RTs, messages, words, elements' },
    { value: 'rt-summary', label: 'RT Summary', desc: 'Remote terminal listing with bus assignments and ICD versions' },
    { value: 'message-list', label: 'Message Catalogue', desc: 'All messages with type, MUX index and block assignments' },
    { value: 'delta', label: 'Delta/Change Report', desc: 'Changes between amendment versions' },
  ];

  const previewData = remoteTerminals.filter(r =>
    (!filters.lruFilter || r.LRU_Name.includes(filters.lruFilter)) &&
    (!filters.busFilter || r.BusId === Number(filters.busFilter))
  );

  if (step === 'generating') {
    return (
      <div>
        <PageHeader title="PDF Report" subtitle="Generating report..." />
        <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
          <SectionCard style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⊟</div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Generating PDF Report</h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Compiling {previewData.length} remote terminals with associated data...
            </p>
            <div style={{ background: 'var(--slate-200)', borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'var(--navy-600)',
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(Math.min(progress, 100))}% complete</span>
          </SectionCard>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div>
        <PageHeader title="PDF Report" subtitle="Report generated successfully"
          actions={<Button variant="secondary" size="sm" onClick={() => { setStep('criteria'); setProgress(0); }}>New Report</Button>}
        />
        <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
          <SectionCard style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Report Ready</h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
              ADA_ICD_Report_{new Date().toISOString().slice(0,10)}.pdf · {Math.round(previewData.length * 0.4 + 2.1)} pages · {(previewData.length * 0.12 + 0.8).toFixed(1)} MB
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => addToast('success', 'PDF download started')}>⬇ Download PDF</Button>
              <Button variant="secondary" onClick={() => addToast('info', 'Opening print dialog...')}>🖨 Print</Button>
              <Button variant="secondary" onClick={() => setStep('preview')}>Preview</Button>
            </div>
          </SectionCard>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div>
        <PageHeader title="PDF Report — Preview" subtitle={`${previewData.length} remote terminals selected`}
          actions={<>
            <Button variant="secondary" size="sm" onClick={() => setStep('criteria')}>← Back to Criteria</Button>
            <Button variant="primary" size="sm" onClick={handleGenerate}>Generate PDF</Button>
          </>}
        />
        <div style={{ padding: 16 }}>
          <SectionCard>
            {/* Mock PDF preview header */}
            <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'var(--slate-50)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy-900)' }}>ADA Interface Control Document</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Generated: {new Date().toLocaleDateString()} · ICD Version: {filters.icdVersion || 'All'} · Format: {filters.format}
                  </div>
                </div>
                <Badge variant="navy">DRAFT PREVIEW</Badge>
              </div>
            </div>
            <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Included Remote Terminals ({previewData.length})</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border)' }}>
                    {['LRU Name', 'Equipment', 'Bus', 'RT Addr', 'ICD Version', 'SW Version'].map(h => (
                      <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 10.5, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((r, i) => (
                    <tr key={r.Id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--slate-50)' }}>
                      <td style={{ padding: '7px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{r.LRU_Name}</td>
                      <td style={{ padding: '7px 12px', fontSize: 12 }}>{r.Equipment}</td>
                      <td style={{ padding: '7px 12px' }}><Badge variant="navy">{busList.find(b => b.BusId === r.BusId)?.BusName}</Badge></td>
                      <td style={{ padding: '7px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{r.RtAddress}</td>
                      <td style={{ padding: '7px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{r.IcdVersionId}</td>
                      <td style={{ padding: '7px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{r.SwVersion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 32px', color: 'var(--text-muted)', fontSize: 12 }}>
              {filters.includeMessages && '✓ Messages included  '}{filters.includeWords && '✓ Words included  '}{filters.includeElements && '✓ Elements included'}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="PDF Report" subtitle="Configure criteria and generate ADA interface control document" />
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Criteria */}
        <SectionCard>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Report Criteria</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Report type */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reportTypes.map(rt => (
                  <label key={rt.value} style={{
                    display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 4, cursor: 'pointer',
                    border: `1px solid ${filters.reportType === rt.value ? 'var(--navy-500)' : 'var(--border)'}`,
                    background: filters.reportType === rt.value ? '#eff6ff' : '#fff',
                  }}>
                    <input type="radio" value={rt.value} checked={filters.reportType === rt.value}
                      onChange={e => setFilters(f => ({ ...f, reportType: e.target.value }))}
                      style={{ marginTop: 2, accentColor: 'var(--navy-600)' }} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{rt.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{rt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>LRU Name Filter</label>
                  <input value={filters.lruFilter} onChange={e => setFilters(f => ({ ...f, lruFilter: e.target.value }))}
                    placeholder="e.g. FCC" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12.5, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Bus</label>
                  <select value={filters.busFilter} onChange={e => setFilters(f => ({ ...f, busFilter: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12.5, background: '#fff', outline: 'none' }}>
                    <option value="">All Buses</option>
                    {busList.map(b => <option key={b.BusId} value={b.BusId}>{b.BusName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>ICD Version</label>
                  <input value={filters.icdVersion} onChange={e => setFilters(f => ({ ...f, icdVersion: e.target.value }))}
                    placeholder="e.g. ICD-FCC-3.2" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12.5, outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* Include sections */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Include Sections</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { key: 'includeMessages', label: 'Messages' },
                  { key: 'includeWords', label: 'Words' },
                  { key: 'includeElements', label: 'Elements' },
                ].map(sec => (
                  <label key={sec.key} style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                    <input type="checkbox" checked={(filters as any)[sec.key]}
                      onChange={e => setFilters(f => ({ ...f, [sec.key]: e.target.checked }))} />
                    {sec.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Page format */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Page Format</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['A4', 'Letter', 'A3'].map(fmt => (
                  <button key={fmt} onClick={() => setFilters(f => ({ ...f, format: fmt }))} style={{
                    padding: '5px 14px', borderRadius: 4, border: '1px solid',
                    borderColor: filters.format === fmt ? 'var(--navy-500)' : 'var(--border)',
                    background: filters.format === fmt ? '#eff6ff' : '#fff',
                    color: filters.format === fmt ? 'var(--navy-700)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
                  }}>{fmt}</button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Summary panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionCard style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>Estimated Output</div>
            {[
              ['Remote Terminals', previewData.length],
              ['Messages (est.)', filters.includeMessages ? Math.round(previewData.length * 4) : 0],
              ['Words (est.)', filters.includeWords ? Math.round(previewData.length * 15) : 0],
              ['Elements (est.)', filters.includeElements ? Math.round(previewData.length * 52) : 0],
              ['Est. Pages', Math.round(previewData.length * 3.2 + 4)],
              ['Est. Size', `${(previewData.length * 0.12 + 0.8).toFixed(1)} MB`],
            ].map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
              </div>
            ))}
          </SectionCard>
          <Button variant="secondary" onClick={() => setStep('preview')}>Preview Report</Button>
          <Button variant="primary" onClick={handleGenerate}>Generate PDF</Button>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
