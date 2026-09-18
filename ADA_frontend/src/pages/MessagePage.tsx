import { useEffect, useMemo, useState } from 'react';
import { Button, EmptyState, FormField, highlightMatch, LoadingRows, PageHeader, Pagination, SearchBar, SectionCard, SelectField, ToastContainer, useSortTable, useToasts } from '../components/UI';
import { API_BASE_URL } from '../config';

type MessageRecord = {
  Id: string;
  BlockId?: string; MsgDescription?: string; BusId?: number | string;
  Source?: string; Destination?: string; WordCount?: number | string;
  Frequency?: string; TxSubAddress?: number | string; RxSubAddress?: number | string;
  MsgRemarks?: string; MessageName?: string; MessageNo?: number | string;
};

type MessageMaintenanceResponse = { status: number; message: string; data?: MessageRecord[] };
type MessageMutationResponse = { status: number; message: string };
type BusApiRecord = { id: number; busId: string };

type MessageForm = {
  BlockId: string; MsgDescription: string; BusId: string; Source: string; Destination: string;
  WordCount: string; Frequency: string; TxSubAddress: string; RxSubAddress: string; MsgRemarks: string;
};

const emptyForm: MessageForm = {
  BlockId: '', MsgDescription: '', BusId: '', Source: '', Destination: '',
  WordCount: '', Frequency: '', TxSubAddress: '', RxSubAddress: '', MsgRemarks: '',
};

const columns: { key: keyof MessageRecord; label: string; width?: number }[] = [
  { key: 'BlockId', label: 'Block ID', width: 110 },
  { key: 'MsgDescription', label: 'Description', width: 180 },
  { key: 'BusId', label: 'Bus', width: 70 },
  { key: 'Source', label: 'Source', width: 100 },
  { key: 'Destination', label: 'Destn', width: 100 },
  { key: 'WordCount', label: 'No of Words', width: 90 },
  { key: 'Frequency', label: 'Freq (Hz)', width: 90 },
  { key: 'TxSubAddress', label: 'Sub Addr Tx', width: 95 },
  { key: 'RxSubAddress', label: 'Sub Addr Rx', width: 95 },
  { key: 'MsgRemarks', label: 'Remarks', width: 150 },
];

const displayValue = (value: unknown) => value === null || value === undefined || value === '' ? '—' : String(value);

const pdfText = (value: unknown, maxLength = 20) => String(value ?? '-')
  .replace(/[^\x20-\x7E]/g, '-')
  .replace(/\\/g, '\\\\')
  .replace(/[()]/g, '\\$&')
  .slice(0, maxLength);

export default function MessagePage() {
  const [data, setData] = useState<MessageRecord[]>([]);
  const [selected, setSelected] = useState<MessageRecord | null>(null);
  const [view, setView] = useState<'list' | 'add'>('list');
  const [form, setForm] = useState<MessageForm>({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MessageForm, string>>>({});
  const [busOptions, setBusOptions] = useState<BusApiRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('No messages found.');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { sort, toggleSort, SortIcon } = useSortTable('BlockId');
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    const controller = new AbortController();
    async function loadMessages() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getAllMessageMaintenance`, { method: 'GET', signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const result = await response.json() as MessageMaintenanceResponse;
        if (result.status === 1) {
          setData(result.data ?? []);
          setEmptyMessage(result.data?.length ? 'No messages found.' : result.message || 'No messages found.');
        } else {
          setData([]);
          setEmptyMessage(result.message || 'No message maintenance records found.');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unable to load message maintenance records.';
        setData([]); setEmptyMessage(message); addToast('error', message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadMessages();
    return () => controller.abort();
  }, [reloadToken]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadBusOptions() {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllBusList`, { method: 'GET', signal: controller.signal });
        if (!response.ok) throw new Error(`Unable to load bus list (${response.status})`);
        const payload: unknown = await response.json();
        const records = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
            ? (payload as { data: unknown[] }).data
            : [];
        setBusOptions(records.filter((record): record is BusApiRecord => typeof record === 'object' && record !== null
          && typeof (record as BusApiRecord).id === 'number' && typeof (record as BusApiRecord).busId === 'string'));
      } catch (error) {
        if (!controller.signal.aborted) addToast('error', error instanceof Error ? error.message : 'Unable to load bus list.');
      }
    }
    loadBusOptions();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = query ? data.filter(row => [row.BlockId, row.MsgDescription, row.Source, row.Destination, row.MsgRemarks]
      .some(value => String(value ?? '').toLowerCase().includes(query))) : [...data];
    return rows.sort((a, b) => {
      const left = String(a[sort.key as keyof MessageRecord] ?? '');
      const right = String(b[sort.key as keyof MessageRecord] ?? '');
      return sort.direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [data, search, sort]);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportPdf = () => {
    const positions = [30, 58, 108, 205, 242, 292, 342, 390, 442, 492, 550];
    const headings = ['Sl', 'Block ID', 'Description', 'Bus', 'Source', 'Destn', 'Words', 'Freq (Hz)', 'Tx', 'Rx', 'Remarks'];
    const rowsPerPage = 32;
    const pages = Array.from({ length: Math.max(1, Math.ceil(filtered.length / rowsPerPage)) }, (_, pageIndex) => {
      const rows = filtered.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
      const text = (x: number, y: number, value: unknown, size = 8) => `BT /F1 ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`;
      const content = [
        text(295, 570, 'MESSAGE TABLE', 14),
        '0.7 w 28 545 m 764 545 l S',
        ...headings.map((heading, index) => text(positions[index], 528, heading, 8)),
        '0.5 w 28 516 m 764 516 l S',
        ...rows.flatMap((row, index) => {
          const y = 497 - index * 15;
          const values = [pageIndex * rowsPerPage + index + 1, row.BlockId, row.MsgDescription, row.BusId, row.Source, row.Destination, row.WordCount, row.Frequency, row.TxSubAddress, row.RxSubAddress, row.MsgRemarks];
          return values.map((value, valueIndex) => text(positions[valueIndex], y, value,8));
        }),
        `0.5 w 28 ${497 - rows.length * 15 + 5} m 764 ${497 - rows.length * 15 + 5} l S`,
        text(690, 24, `Page ${pageIndex + 1} of ${Math.max(1, Math.ceil(filtered.length / rowsPerPage))}`, 7),
      ].join('\n');
      return content;
    });
    const objects: string[] = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [] /Count 0 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'];
    const pageObjectIds: number[] = [];
    pages.forEach(content => {
      const pageId = objects.length + 1;
      const contentId = pageId + 1;
      pageObjectIds.push(pageId);
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
      objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    });
    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'message-table.pdf'; link.click();
    URL.revokeObjectURL(url);
  };

  const updateForm = (key: keyof MessageForm, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
    setFormErrors(current => {
      if (!current[key]) return current;
      const { [key]: _, ...remaining } = current;
      return remaining;
    });
  };
  const numberOrNull = (value: string) => value.trim() === '' ? null : Number(value);

  const createMessage = async () => {
    const errors: Partial<Record<keyof MessageForm, string>> = {};
    if (!form.BlockId.trim()) errors.BlockId = 'Block ID is required';
    if (!form.BusId) errors.BusId = 'Bus is required';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/createMessageMaintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LRU_Name: null, IcdVersionId: null, AmndNo: null, MessageName: null, MessageNo: null,
          MessageAliasName: null, MessageTypeId: null, MuxIdxId: null,
          MsgDescription: form.MsgDescription || null, BlockId: form.BlockId || null,
          BusId: Number(form.BusId), Frequency: form.Frequency || null,
          Source: form.Source || null, Destination: form.Destination || null, RtAddress: null,
          WordCount: numberOrNull(form.WordCount), RxSubAddress: numberOrNull(form.RxSubAddress),
          TxSubAddress: numberOrNull(form.TxSubAddress), CmdWord: null, FramesId: 1,
          MsgRemarks: form.MsgRemarks || null, CreatedBy: 1, RemoteTableId: "RTM01", Status: null,
          AliasDescription: null, approvedBy: null, AdminRemarks: null, MessageId: null,
          MuxPos: null, MuxStartBit: null, MuxEndBit: null,
        }),
      });
      const result = await response.json() as MessageMutationResponse;
      if (!response.ok || result.status !== 1) throw new Error(result.message || `Unable to create message (${response.status})`);
      addToast('success', result.message || 'Message created successfully');
      setForm({ ...emptyForm });
      setView('list');
      setReloadToken(token => token + 1);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Unable to create message.');
    } finally {
      setSaving(false);
    }
  };

  if (view === 'add') {
    const formFields: { key: Exclude<keyof MessageForm, 'BusId'>; label: string; type?: 'number'; rows?: number; required?: boolean }[] = [
      { key: 'BlockId', label: 'Block ID', required: true },
      { key: 'Source', label: 'Source' },
      { key: 'Destination', label: 'Destination' }, { key: 'WordCount', label: 'No. of Words', type: 'number' },
      { key: 'Frequency', label: 'Frequency (Hz)' }, { key: 'TxSubAddress', label: 'Sub Address Tx', type: 'number' },
      { key: 'RxSubAddress', label: 'Sub Address Rx', type: 'number' }, { key: 'MsgDescription', label: 'Description', rows: 3 },
      { key: 'MsgRemarks', label: 'Remarks', rows: 3 },
    ];
    return <div>
      <PageHeader title="Add Message" subtitle="Message Maintenance" actions={<>
        <Button variant="secondary" size="sm" onClick={() => setView('list')}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={createMessage} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</Button>
      </>} />
      <div style={{ padding: 24 }}><SectionCard style={{ maxWidth: 900 }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20 }}>
        {formFields.slice(0, 1).map(field => <FormField key={field.key} label={field.label} type={field.type} rows={field.rows} required={field.required} error={formErrors[field.key]} value={form[field.key]} onChange={value => updateForm(field.key, value)} />)}
        <SelectField label="Bus" value={form.BusId} required error={formErrors.BusId} options={busOptions.map(bus => ({ value: bus.id, label: bus.busId }))} onChange={value => updateForm('BusId', value)} />
        {formFields.slice(1, 7).map(field => <FormField key={field.key} label={field.label} type={field.type} rows={field.rows} required={field.required} error={formErrors[field.key]} value={form[field.key]} onChange={value => updateForm(field.key, value)} />)}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {formFields.slice(7).map(field => <FormField key={field.key} label={field.label} type={field.type} rows={field.rows} required={field.required} error={formErrors[field.key]} value={form[field.key]} onChange={value => updateForm(field.key, value)} />)}
        </div>
      </div></SectionCard></div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>;
  }

  if (selected) {
    const fields: [string, unknown][] = [
      ['Block ID', selected.BlockId], ['Description', selected.MsgDescription], ['Bus', selected.BusId],
      ['Source', selected.Source], ['Destination', selected.Destination], ['No. of Words', selected.WordCount],
      ['Frequency (Hz)', selected.Frequency], ['Sub Address Tx', selected.TxSubAddress], ['Sub Address Rx', selected.RxSubAddress],
      ['Remarks', selected.MsgRemarks], ['Message Name', selected.MessageName], ['Message No.', selected.MessageNo],
    ];
    return <div>
      <PageHeader title={selected.MessageName || selected.BlockId || 'Message'} subtitle="Message Maintenance" actions={<Button variant="secondary" size="sm" onClick={() => setSelected(null)}>← Back</Button>} />
      <div style={{ padding: 24 }}><SectionCard style={{ maxWidth: 920 }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, padding: 20 }}>
        {fields.map(([label, value]) => <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{label}</span>
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{displayValue(value)}</span>
        </div>)}
      </div></SectionCard></div>
    </div>;
  }

  return <div style={{ position: 'relative' }}>
    <PageHeader title="Message Maintenance" subtitle={`${data.length} messages`} />
    <div style={{ position: 'absolute', right: 24, top: 20, display: 'flex', gap: 8 }}>
      <Button variant="secondary" size="sm" onClick={exportPdf}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 5 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 15h8M8 18h5M8 12h3" />
        </svg>
        Export
      </Button>
      <Button variant="primary" size="sm" onClick={() => { setForm({ ...emptyForm }); setFormErrors({}); setView('add'); }}>+ Add Message</Button>
    </div>
    <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
      <SearchBar value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Search block, source, destination..." />
      <span style={{ marginLeft: 'auto', alignSelf: 'center', color: 'var(--text-muted)', fontSize: 12 }}>{filtered.length} results</span>
    </div>
    <SectionCard style={{ margin: 16, marginTop: 12 }}><div style={{ minHeight: 320, maxHeight: 'calc(100vh - 230px)', overflow: 'auto' }}>
      <table style={{ width: '100%', minWidth: 1180, borderCollapse: 'collapse' }}><thead><tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
        <th style={{ padding: '8px 12px', textAlign: 'left', width: 52, position: 'sticky', top: 0, zIndex: 2, background: 'var(--slate-50)' }}><span style={{ fontSize: 10.5, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sl No</span></th>
        {columns.map(column => <th key={column.key} onClick={() => toggleSort(column.key)} style={{ padding: '8px 12px', textAlign: 'left', minWidth: column.width, cursor: 'pointer', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2, background: 'var(--slate-50)' }}><span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{column.label}<SortIcon col={column.key} /></span></th>)}
        <th style={{ padding: '8px 12px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 2, background: 'var(--slate-50)' }}><span style={{ fontSize: 10.5, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Action</span></th>
      </tr></thead><tbody>
        {loading ? <LoadingRows cols={columns.length + 2} /> : pageData.length === 0 ? <tr><td colSpan={columns.length + 2}><EmptyState message={emptyMessage} /></td></tr> : pageData.map((message, index) => <tr key={message.Id} style={{ borderBottom: '1px solid var(--border)', background: index % 2 ? 'var(--slate-50)' : '#fff' }}>
          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{(page - 1) * pageSize + index + 1}</td>
          {columns.map(column => <td key={column.key} style={{ padding: '10px 12px', fontSize: 12, fontFamily: column.key === 'MsgDescription' || column.key === 'MsgRemarks' ? undefined : 'JetBrains Mono, monospace' }}>{highlightMatch(displayValue(message[column.key]), search)}</td>)}
          <td style={{ padding: '8px 12px', textAlign: 'right' }}><Button variant="ghost" size="sm" onClick={() => setSelected(message)}>View</Button></td>
        </tr>)}
      </tbody></table>
    </div><Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1); }} /></SectionCard>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  </div>;
}
