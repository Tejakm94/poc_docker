import { useEffect, useMemo, useState } from 'react';
import { EmptyState, highlightMatch, LoadingRows, PageHeader, Pagination, SearchBar, SectionCard, ToastContainer, useSortTable, useToasts } from '../components/UI';
import { API_BASE_URL } from '../config';

type WordRecord = {
  Id: number | string;
  LRU_Name?: string;
  IcdVersionId?: string;
  AmndNo?: string;
  MessageName?: string;
  BlockId?: string;
  WordName?: string;
  No_of_elements?: number | string;
  Description?: string;
  WordRemarks?: string;
  WordNo?: number | string;
  WordId?: number | string;
  CreatedAt?: string;
  CreatedBy?: number | string;
  updatedAt?: string;
  updatedBy?: number | string;
  RemoteTableId?: number | string;
  MessageTableId?: number | string;
  WordCount?: number | string;
  ApprovedAt?: string;
  ApprovedBy?: number | string;
  IsApproved?: number | string;
  MessageNo?: number | string;
  AdminRemarks?: string;
  WordApplicability?: number | string;
  WordAliasName?: string;
};

type WordMaintenanceResponse = { status: number; message: string; data?: WordRecord[] };

const columns: { key: keyof WordRecord; label: string; width: number; mono?: boolean }[] = [
  { key: 'Id', label: 'ID', width: 80, mono: true },
  { key: 'LRU_Name', label: 'LRU Name', width: 120, mono: true },
  { key: 'IcdVersionId', label: 'ICD Version ID', width: 125, mono: true },
  { key: 'AmndNo', label: 'Amnd No.', width: 90, mono: true },
  { key: 'MessageName', label: 'Message Name', width: 145, mono: true },
  { key: 'BlockId', label: 'Block ID', width: 110, mono: true },
  { key: 'WordName', label: 'Word Name', width: 180, mono: true },
  { key: 'No_of_elements', label: 'No. of Elements', width: 120 },
  { key: 'Description', label: 'Description', width: 220 },
  { key: 'WordRemarks', label: 'Word Remarks', width: 160 },
  { key: 'WordNo', label: 'Word No.', width: 100, mono: true },
  { key: 'WordId', label: 'Word ID', width: 105, mono: true },
  { key: 'CreatedAt', label: 'Created At', width: 150 },
  { key: 'CreatedBy', label: 'Created By', width: 100 },
  { key: 'updatedAt', label: 'Updated At', width: 150 },
  { key: 'updatedBy', label: 'Updated By', width: 100 },
  { key: 'RemoteTableId', label: 'Remote Table ID', width: 135, mono: true },
  { key: 'MessageTableId', label: 'Message Table ID', width: 140, mono: true },
  { key: 'WordCount', label: 'Word Count', width: 100 },
  { key: 'ApprovedAt', label: 'Approved At', width: 145 },
  { key: 'ApprovedBy', label: 'Approved By', width: 110 },
  { key: 'IsApproved', label: 'Is Approved', width: 105 },
  { key: 'MessageNo', label: 'Message No.', width: 110 },
  { key: 'AdminRemarks', label: 'Admin Remarks', width: 170 },
  { key: 'WordApplicability', label: 'Word Applicability', width: 140 },
  { key: 'WordAliasName', label: 'Word Alias Name', width: 145, mono: true },
];

const displayValue = (value: unknown) => value === null || value === undefined || value === '' ? '-' : String(value);

export default function WordMaintenancePage() {
  const [data, setData] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('No words found.');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { sort, toggleSort, SortIcon } = useSortTable('WordName');
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    const controller = new AbortController();
    async function loadWords() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getAllWordMaintenance`, { method: 'GET', signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const result = await response.json() as WordMaintenanceResponse;
        if (result.status === 1) {
          setData(result.data ?? []);
          setEmptyMessage(result.data?.length ? 'No words found.' : result.message || 'No words found.');
        } else {
          setData([]);
          setEmptyMessage(result.message || 'No word maintenance records found.');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unable to load word maintenance records.';
        setData([]);
        setEmptyMessage(message);
        addToast('error', message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadWords();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = query ? data.filter(word => columns.some(column => String(word[column.key] ?? '').toLowerCase().includes(query))) : [...data];
    return rows.sort((a, b) => {
      const left = String(a[sort.key as keyof WordRecord] ?? '');
      const right = String(b[sort.key as keyof WordRecord] ?? '');
      return sort.direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [data, search, sort]);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div>
    <PageHeader title="Word Maintenance" subtitle={`${data.length} words · Ada.dbo.Word`} />
    <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
      <SearchBar value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Search words..." />
      <span style={{ marginLeft: 'auto', alignSelf: 'center', color: 'var(--text-muted)', fontSize: 12 }}>{filtered.length} results</span>
    </div>
    <SectionCard style={{ margin: 16, marginTop: 12 }}>
      <div style={{ minHeight: 320, maxHeight: 'calc(100vh - 230px)', overflow: 'auto' }}>
        <table style={{ width: '100%', minWidth: 3560, borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
            {columns.map(column => <th key={column.key} onClick={() => toggleSort(column.key)} style={{ padding: '8px 12px', minWidth: column.width, textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2, background: 'var(--slate-50)' }}><span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{column.label}<SortIcon col={column.key} /></span></th>)}
          </tr></thead>
          <tbody>
            {loading ? <LoadingRows cols={columns.length} /> : pageData.length === 0 ? <tr><td colSpan={columns.length}><EmptyState message={emptyMessage} /></td></tr> : pageData.map((word, index) => <tr key={word.Id} style={{ borderBottom: '1px solid var(--border)', background: index % 2 ? 'var(--slate-50)' : '#fff' }}>
              {columns.map(column => <td key={column.key} style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap', fontFamily: column.mono ? 'JetBrains Mono, monospace' : undefined }}>{highlightMatch(displayValue(word[column.key]), search)}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1); }} />
    </SectionCard>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  </div>;
}
