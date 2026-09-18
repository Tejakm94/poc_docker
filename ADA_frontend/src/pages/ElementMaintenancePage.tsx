import { useEffect, useMemo, useState } from 'react';
import { EmptyState, highlightMatch, LoadingRows, PageHeader, Pagination, SearchBar, SectionCard, ToastContainer, useSortTable, useToasts } from '../components/UI';
import { API_BASE_URL } from '../config';

type ElementRecord = Record<string, unknown> & { Id: string | number };
type ElementMaintenanceResponse = { status: number; message: string; data?: ElementRecord[] };

const labelFor = (key: string) => key
  .replace(/_/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/\b\w/g, character => character.toUpperCase());

const displayValue = (value: unknown) => value === null || value === undefined || value === '' ? '-' : String(value);

export default function ElementMaintenancePage() {
  const [data, setData] = useState<ElementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('No elements found.');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { sort, toggleSort, SortIcon } = useSortTable('Id');
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    const controller = new AbortController();
    async function loadElements() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getAllElementMaintenance`, { method: 'GET', signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const result = await response.json() as ElementMaintenanceResponse;
        if (result.status === 1) {
          setData(result.data ?? []);
          setEmptyMessage(result.data?.length ? 'No elements found.' : result.message || 'No elements found.');
        } else {
          setData([]);
          setEmptyMessage(result.message || 'No element maintenance records found.');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unable to load element maintenance records.';
        setData([]);
        setEmptyMessage(message);
        addToast('error', message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadElements();
    return () => controller.abort();
  }, []);

  const columns = useMemo(() => {
    const keys = [...new Set(data.flatMap(record => Object.keys(record)))];
    return keys.sort((left, right) => left === 'Id' ? -1 : right === 'Id' ? 1 : left.localeCompare(right));
  }, [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = query ? data.filter(element => columns.some(column => String(element[column] ?? '').toLowerCase().includes(query))) : [...data];
    return rows.sort((a, b) => {
      const left = String(a[sort.key] ?? '');
      const right = String(b[sort.key] ?? '');
      return sort.direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [columns, data, search, sort]);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div>
    <PageHeader title="Element Maintenance" subtitle={`${data.length} elements · Ada.dbo.Element`} />
    <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
      <SearchBar value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Search elements..." />
      <span style={{ marginLeft: 'auto', alignSelf: 'center', color: 'var(--text-muted)', fontSize: 12 }}>{filtered.length} results</span>
    </div>
    <SectionCard style={{ margin: 16, marginTop: 12 }}>
      <div style={{ minHeight: 320, maxHeight: 'calc(100vh - 230px)', overflow: 'auto' }}>
        <table style={{ width: '100%', minWidth: Math.max(1000, columns.length * 135), borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
            {columns.map(column => <th key={column} onClick={() => toggleSort(column)} style={{ padding: '8px 12px', minWidth: 120, textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2, background: 'var(--slate-50)' }}><span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{labelFor(column)}<SortIcon col={column} /></span></th>)}
          </tr></thead>
          <tbody>
            {loading ? <LoadingRows cols={Math.max(columns.length, 1)} /> : pageData.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)}><EmptyState message={emptyMessage} /></td></tr> : pageData.map((element, index) => <tr key={String(element.Id)} style={{ borderBottom: '1px solid var(--border)', background: index % 2 ? 'var(--slate-50)' : '#fff' }}>
              {columns.map(column => <td key={column} style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap', fontFamily: column === 'Description' || column.includes('Remarks') ? undefined : 'JetBrains Mono, monospace' }}>{highlightMatch(displayValue(element[column]), search)}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1); }} />
    </SectionCard>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  </div>;
}
