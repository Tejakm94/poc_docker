import { useEffect, useState, useMemo } from 'react';
import type { RemoteTerminal } from '../types';
import {
  Button, Badge, Modal, ConfirmDelete, FormField, SelectField,
  Pagination, SearchBar, PageHeader, SectionCard, Tabs,
  useSortTable, LoadingRows, EmptyState, useToasts, ToastContainer,
} from '../components/UI';
import { busList, messages } from '../mockData';
import { API_BASE_URL } from '../config';

type ViewMode = 'list' | 'view' | 'add' | 'edit';

type RemoteTerminalForm = Omit<RemoteTerminal,
  'Id' | 'CreatedAt' | 'CreatedBy' | 'UpdatedAt' | 'UpdatedBy' | 'ApprovedAt' | 'ApprovedBy' | 'IsApproved'
>;

type RemoteTerminalMaintenanceResponse = {
  status: number;
  message: string;
  data: RemoteTerminal[];
};

type BusApiRecord = {
  id: number;
  busId: string;
};

type AircraftApiRecord = {
  id: number;
  aircraftName: string;
};

type GuidelineApiRecord = {
  id: number;
  guideline: string;
};

type RemoteTerminalMutationResponse = {
  status: number;
  message: string;
  data?: { id?: string };
};

const todayAsInputDate = () => {
  const now = new Date();
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
};

const dateOnly = (value?: string) => value ? value.slice(0, 10) : null;

const readMutationResponse = async (response: Response): Promise<RemoteTerminalMutationResponse> => {
  const body = await response.text();
  if (!body) {
    return {
      status: response.ok ? 1 : 0,
      message: response.ok ? 'Remote terminal maintenance saved successfully' : `Request failed (${response.status})`,
    };
  }

  try {
    return JSON.parse(body) as RemoteTerminalMutationResponse;
  } catch {
    return {
      status: response.ok ? 1 : 0,
      message: body,
    };
  }
};

const emptyRT: RemoteTerminalForm = {
  LRU_Name: '', Equipment: '', ManufactureId: '', BusId: 0,
  RtAddress: '', IcdVersionId: '', SwVersion: '', ReleaseVersion: '',
  AmndNo: '', RtNote: '', RtRemarks: '',
  AircraftType: undefined, SelectAircraftIds: '', GuidelineId: undefined,
  SelectedProgrammesId: '', HardwareVersion: '', AmndDate: todayAsInputDate(),
  AdminRemarks: '', FileName: '',
};

function validate(rt: typeof emptyRT) {
  const errs: Partial<Record<keyof typeof emptyRT, string>> = {};
  if (!rt.LRU_Name.trim()) errs.LRU_Name = 'LRU Name is required';
  if (!String(rt.Equipment ?? '').trim() || !Number.isFinite(Number(rt.Equipment))) errs.Equipment = 'Equipment ID is required';
  if (!String(rt.ManufactureId ?? '').trim() || !Number.isFinite(Number(rt.ManufactureId))) errs.ManufactureId = 'Manufacturer ID is required';
  if (!rt.BusId) errs.BusId = 'Bus ID is required';
  if (!rt.RtAddress.trim()) errs.RtAddress = 'RT Address is required';
  if (!rt.IcdVersionId.trim()) errs.IcdVersionId = 'ICD Version is required';
  if (!rt.AircraftType || !Number.isFinite(rt.AircraftType)) errs.AircraftType = 'Aircraft Type is required';
  if (!rt.GuidelineId || !Number.isFinite(rt.GuidelineId)) errs.GuidelineId = 'Guideline ID is required';
  return errs;
}

export default function RemoteTerminalPage() {
  const [data, setData] = useState<RemoteTerminal[]>([]);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<RemoteTerminal['Id'] | null>(null);
  const [form, setForm] = useState<typeof emptyRT>({ ...emptyRT });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyRT, string>>>({});
  const [deleteId, setDeleteId] = useState<RemoteTerminal['Id'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('No remote terminals found.');
  const [busOptions, setBusOptions] = useState<BusApiRecord[]>([]);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftApiRecord[]>([]);
  const [guidelineOptions, setGuidelineOptions] = useState<GuidelineApiRecord[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filterBus, setFilterBus] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<RemoteTerminal['Id']>>(new Set());
  const [detailTab, setDetailTab] = useState('details');
  const { sort, toggleSort, SortIcon } = useSortTable('LRU_Name');
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    const controller = new AbortController();

    async function loadRemoteTerminals() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getAllRemoteTerminalMaintenance`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);

        const result = await response.json() as RemoteTerminalMaintenanceResponse;
        if (result.status === 1) {
          setData(result.data ?? []);
          setEmptyMessage(result.data?.length ? 'No remote terminals found.' : result.message || 'No remote terminals found.');
        } else if (result.status === 0) {
          setData([]);
          setEmptyMessage(result.message || 'No remote terminal maintenance records found.');
        } else {
          throw new Error(result.message || 'Unable to load remote terminal maintenance records.');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unable to load remote terminal maintenance records.';
        setData([]);
        setEmptyMessage(message);
        addToast('error', message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadRemoteTerminals();
    return () => controller.abort();
  }, [reloadToken]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBusOptions() {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllBusList`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Unable to load bus list (${response.status})`);

        const payload: unknown = await response.json();
        const records = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
            ? (payload as { data: unknown[] }).data
            : payload && typeof payload === 'object' && 'id' in payload && 'busId' in payload
              ? [payload]
              : [];

        setBusOptions(records.filter((record): record is BusApiRecord => (
          typeof record === 'object' && record !== null
          && typeof (record as BusApiRecord).id === 'number'
          && typeof (record as BusApiRecord).busId === 'string'
        )));
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unable to load bus list.';
        addToast('error', message);
      }
    }

    loadBusOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReferenceOptions() {
      try {
        const [aircraftResponse, guidelineResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/getAllAircraftList`, { method: 'GET', signal: controller.signal }),
          fetch(`${API_BASE_URL}/getAllGuidelines`, { method: 'GET', signal: controller.signal }),
        ]);
        if (!aircraftResponse.ok) throw new Error(`Unable to load aircraft list (${aircraftResponse.status})`);
        if (!guidelineResponse.ok) throw new Error(`Unable to load guidelines (${guidelineResponse.status})`);

        const [aircraftPayload, guidelinePayload]: unknown[] = await Promise.all([
          aircraftResponse.json(),
          guidelineResponse.json(),
        ]);
        const aircraftRecords = aircraftPayload && typeof aircraftPayload === 'object' && Array.isArray((aircraftPayload as { data?: unknown }).data)
          ? (aircraftPayload as { data: unknown[] }).data : [];
        const guidelineRecords = guidelinePayload && typeof guidelinePayload === 'object' && Array.isArray((guidelinePayload as { data?: unknown }).data)
          ? (guidelinePayload as { data: unknown[] }).data : [];

        setAircraftOptions(aircraftRecords.filter((record): record is AircraftApiRecord => typeof record === 'object' && record !== null
          && typeof (record as AircraftApiRecord).id === 'number' && typeof (record as AircraftApiRecord).aircraftName === 'string'));
        setGuidelineOptions(guidelineRecords.filter((record): record is GuidelineApiRecord => typeof record === 'object' && record !== null
          && typeof (record as GuidelineApiRecord).id === 'number' && typeof (record as GuidelineApiRecord).guideline === 'string'));
      } catch (error) {
        if (controller.signal.aborted) return;
        addToast('error', error instanceof Error ? error.message : 'Unable to load aircraft and guideline options.');
      }
    }

    loadReferenceOptions();
    return () => controller.abort();
  }, []);

  const selected = data.find(r => r.Id === selectedId);

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r =>
        r.LRU_Name.toLowerCase().includes(s) ||
        String(r.Equipment).toLowerCase().includes(s) ||
        String(r.ManufactureId).toLowerCase().includes(s) ||
        r.RtAddress.toLowerCase().includes(s)
      );
    }
    if (filterBus) rows = rows.filter(r => String(r.BusId) === filterBus);
    rows.sort((a, b) => {
      const av = (a as any)[sort.key] ?? '';
      const bv = (b as any)[sort.key] ?? '';
      return sort.direction === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [data, search, filterBus, sort]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const availableBusIds = useMemo(() => [...new Set(data.map(row => row.BusId))], [data]);

  const highlightMatch = (value: unknown) => {
    const text = value === undefined || value === null || value === '' ? '—' : String(value);
    const query = search.trim();
    const matchStart = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
    if (matchStart === -1) return text;

    const matchEnd = matchStart + query.length;
    return <>{text.slice(0, matchStart)}<mark style={{ background: 'rgb(255 225 15)', color: 'inherit', borderRadius: 2, padding: '0 1px' }}>{text.slice(matchStart, matchEnd)}</mark>{text.slice(matchEnd)}</>;
  };

  const openAdd = () => {
    setForm({ ...emptyRT });
    setErrors({});
    setView('add');
  };

  const openEdit = (rt: RemoteTerminal) => {
    const { Id, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, ApprovedAt, ApprovedBy, IsApproved, BusId, ...rest } = rt;
    const matchingBus = busOptions.find(bus => bus.id === Number(BusId) || bus.busId === String(BusId));
    setForm({
      ...rest,
      Equipment: String(rest.Equipment ?? ''),
      ManufactureId: String(rest.ManufactureId ?? ''),
      BusId: matchingBus?.id ?? (typeof BusId === 'number' ? BusId : 0),
    });
    setErrors({});
    setSelectedId(rt.Id);
    setView('edit');
  };

  const openView = (rt: RemoteTerminal) => {
    setSelectedId(rt.Id);
    setDetailTab('details');
    setView('view');
  };

  const updateField = <K extends keyof typeof emptyRT>(key: K, value: typeof emptyRT[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => {
      if (!current[key]) return current;
      const { [key]: _, ...remaining } = current;
      return remaining;
    });
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (view === 'add') {
      const selectedBus = busOptions.find(bus => bus.id === form.BusId);
      if (!selectedBus) {
        setErrors({ BusId: 'Select a bus from the available list' });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/createRemoteTerminalMaintenance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lruName: form.LRU_Name,
            equipment: Number(form.Equipment),
            manufactureId: Number(form.ManufactureId),
            busId: selectedBus.busId,
            rtAddress: form.RtAddress,
            icdVersionId: form.IcdVersionId,
            swVersion: form.SwVersion,
            releaseVersion: form.ReleaseVersion,
            amndNo: form.AmndNo,
            rtNote: form.RtNote,
            rtRemarks: form.RtRemarks,
            createdBy: 1,
            aircraftType: form.AircraftType ?? null,
            selectAircraftIds: String(form.AircraftType),
            guidelineId: form.GuidelineId ?? null,
            selectedProgrammesId: form.SelectedProgrammesId || '',
            hardwareVersion: form.HardwareVersion || '',
            amndDate: dateOnly(form.AmndDate),
            adminRemarks: form.AdminRemarks || '',
            fileName: form.FileName || '',
          }),
        });
        const result = await readMutationResponse(response);
        if (!response.ok || result.status !== 1) {
          throw new Error(result.message || `Unable to create record (${response.status})`);
        }

        addToast('success', result.message || 'Remote terminal maintenance created successfully');
        setView('list');
        setReloadToken(token => token + 1);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create remote terminal maintenance record.';
        addToast('error', message);
      }
      return;
    } else {
      const selectedBus = busOptions.find(bus => bus.id === form.BusId);
      if (selectedId === null || !selectedBus) {
        setErrors({ BusId: 'Select a bus from the available list' });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/updateRemoteTerminalMaintenance`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedId,
            lruName: form.LRU_Name,
            equipment: Number(form.Equipment),
            manufactureId: Number(form.ManufactureId),
            busId: selectedBus.busId,
            rtAddress: form.RtAddress,
            icdVersionId: form.IcdVersionId,
            swVersion: form.SwVersion,
            releaseVersion: form.ReleaseVersion,
            amndNo: form.AmndNo,
            rtNote: form.RtNote,
            rtRemarks: form.RtRemarks,
            createdBy: 1,
            updatedBy: 1,
            aircraftType: form.AircraftType ?? null,
            selectAircraftIds: String(form.AircraftType),
            guidelineId: form.GuidelineId ?? null,
            selectedProgrammesId: form.SelectedProgrammesId || '',
            hardwareVersion: form.HardwareVersion || '',
            amndDate: dateOnly(form.AmndDate),
            adminRemarks: form.AdminRemarks || '',
            fileName: form.FileName || '',
          }),
        });
        const result = await readMutationResponse(response);
        if (!response.ok || result.status !== 1) {
          throw new Error(result.message || `Unable to update record (${response.status})`);
        }

        addToast('success', result.message || 'Remote terminal maintenance updated successfully');
        setView('list');
        setReloadToken(token => token + 1);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update remote terminal maintenance record.';
        addToast('error', message);
      }
    }
  };

  const handleDelete = (id: RemoteTerminal['Id']) => {
    const rt = data.find(r => r.Id === id);
    setData(prev => prev.filter(r => r.Id !== id));
    setDeleteId(null);
    if (view === 'view') setView('list');
    addToast('success', `Remote Terminal "${rt?.LRU_Name}" deleted`);
  };

  const toggleRow = (id: RemoteTerminal['Id']) => {
    setSelectedRows(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === pageData.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(pageData.map(r => r.Id)));
  };

  const busName = (id: number | string) => busOptions.find(b => b.id === Number(id) || b.busId === String(id))?.busId
    ?? busList.find(b => b.BusId === Number(id))?.BusName
    ?? `Bus ${id}`;
  const relatedMessages = selected ? messages.filter(m => m.LRU_Name === selected.LRU_Name) : [];

  const cols: { key: keyof RemoteTerminal; label: string; width?: number }[] = [
    { key: 'Id', label: 'ID', width: 64 },
    { key: 'LRU_Name', label: 'LRU Name', width: 130 },
    { key: 'Equipment', label: 'Equipment', width: 180 },
    { key: 'ManufactureId', label: 'Manufacture ID', width: 115 },
    { key: 'BusId', label: 'Bus ID', width: 95 },
    { key: 'RtAddress', label: 'RT Address', width: 95 },
    { key: 'IcdVersionId', label: 'ICD Version ID', width: 125 },
    { key: 'SwVersion', label: 'SW Version', width: 105 },
    { key: 'ReleaseVersion', label: 'Release Version', width: 120 },
    { key: 'AmndNo', label: 'Amnd No.', width: 85 },
    { key: 'RtNote', label: 'RT Note', width: 150 },
    { key: 'RtRemarks', label: 'RT Remarks', width: 170 },
    { key: 'CreatedAt', label: 'Created At', width: 145 },
    { key: 'CreatedBy', label: 'Created By', width: 100 },
    { key: 'UpdatedBy', label: 'Updated By', width: 100 },
    { key: 'UpdatedAt', label: 'Updated At', width: 145 },
    { key: 'AircraftType', label: 'Aircraft Type', width: 105 },
    { key: 'SelectAircraftIds', label: 'Select Aircraft IDs', width: 150 },
    { key: 'GuidelineId', label: 'Guideline ID', width: 105 },
    { key: 'SelectedProgrammesId', label: 'Selected Programmes ID', width: 175 },
    { key: 'HardwareVersion', label: 'Hardware Version', width: 135 },
    { key: 'AmndDate', label: 'Amnd Date', width: 125 },
    { key: 'ApprovedAt', label: 'Approved At', width: 135 },
    { key: 'ApprovedBy', label: 'Approved By', width: 110 },
    { key: 'IsApproved', label: 'Is Approved', width: 105 },
    { key: 'AdminRemarks', label: 'Admin Remarks', width: 160 },
    { key: 'FileName', label: 'File Name', width: 150 },
  ];

  if (view === 'view' && selected) {
    return (
      <div>
        <PageHeader
          title={selected.LRU_Name}
          subtitle={`Remote Terminal · ${selected.Equipment}`}
          actions={<>
            <Button variant="secondary" size="sm" onClick={() => setView('list')}>← Back</Button>
            <Button variant="secondary" size="sm" onClick={() => openEdit(selected)}>Edit</Button>
            {/* <Button variant="danger" size="sm" onClick={() => setDeleteId(selected.Id)}>Delete</Button> */}
          </>}
        />
        <div style={{ padding: 24 }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <Tabs
              tabs={[
                { id: 'details', label: 'Details' },
                { id: 'messages', label: 'Messages', count: relatedMessages.length },
                { id: 'system', label: 'System Info' },
              ]}
              active={detailTab} onChange={setDetailTab}
            />
            <div style={{ padding: 20 }}>
              {detailTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  {[
                    ['ID', selected.Id],
                    ['LRU Name', selected.LRU_Name],
                    ['Equipment', selected.Equipment],
                    ['Manufacturer ID', selected.ManufactureId],
                    ['Bus', busName(selected.BusId)],
                    ['RT Address', selected.RtAddress],
                    ['ICD Version', selected.IcdVersionId],
                    ['SW Version', selected.SwVersion],
                    ['Release Version', selected.ReleaseVersion],
                    ['Amendment No.', selected.AmndNo],
                    ['RT Note', selected.RtNote],
                    ['RT Remarks', selected.RtRemarks],
                    ['Created At', selected.CreatedAt],
                    ['Created By', selected.CreatedBy],
                    ['Updated At', selected.UpdatedAt],
                    ['Updated By', selected.UpdatedBy],
                    ['Aircraft Type', selected.AircraftType],
                    ['Selected Aircraft IDs', selected.SelectAircraftIds],
                    ['Guideline ID', selected.GuidelineId],
                    ['Selected Programmes IDs', selected.SelectedProgrammesId],
                    ['Hardware Version', selected.HardwareVersion],
                    ['Amendment Date', selected.AmndDate],
                    ['Approved At', selected.ApprovedAt],
                    ['Approved By', selected.ApprovedBy],
                    ['Is Approved', selected.IsApproved === undefined || selected.IsApproved === null ? undefined : selected.IsApproved === 1 ? 'Yes' : 'No'],
                    ['Admin Remarks', selected.AdminRemarks],
                    ['File Name', selected.FileName],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{val || '—'}</span>
                    </div>
                  ))}
                  <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RT Note</span>
                    <span style={{ fontSize: 13 }}>{selected.RtNote || '—'}</span>
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RT Remarks</span>
                    <span style={{ fontSize: 13 }}>{selected.RtRemarks || '—'}</span>
                  </div>
                </div>
              )}
              {detailTab === 'messages' && (
                relatedMessages.length === 0
                  ? <EmptyState message="No messages linked to this Remote Terminal." />
                  : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border)' }}>
                        {['Message Name', 'Message No', 'Type', 'Block ID', 'Description'].map(h => (
                          <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10.5, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relatedMessages.map((m, i) => (
                        <tr key={m.Id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--slate-50)' : '#fff' }}>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{m.MessageName}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{m.MessageNo}</td>
                          <td style={{ padding: '8px 12px' }}><Badge variant="info">{m.MessageTypeId}</Badge></td>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{m.BlockId}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{m.MsgDescription}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              )}
              {detailTab === 'system' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 500 }}>
                  {[
                    ['Record ID', String(selected.Id)],
                    ['Created By', selected.CreatedBy],
                    ['Created At', new Date(selected.CreatedAt).toLocaleString()],
                    ['Updated By', selected.UpdatedBy],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <ConfirmDelete open={deleteId !== null} name={selected.LRU_Name}
          onConfirm={() => handleDelete(deleteId!)} onCancel={() => setDeleteId(null)} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (view === 'add' || view === 'edit') {
    const title = view === 'add' ? 'Add Remote Terminal' : `Edit: ${selected?.LRU_Name}`;
    return (
      <div>
        <PageHeader title={title} subtitle="Remote Terminal Maintenance"
          actions={<>
            <Button variant="secondary" size="sm" onClick={() => setView(view === 'edit' ? 'view' : 'list')}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Save Record</Button>
          </>}
        />
        <div style={{ padding: 24 }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: 24, maxWidth: 900 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <FormField label="LRU Name" value={form.LRU_Name} onChange={v => updateField('LRU_Name', v)}
                required placeholder="e.g. LRU-001" error={errors.LRU_Name} />
              <FormField label="Equipment ID" type="number" value={form.Equipment} onChange={v => updateField('Equipment', v)}
                required placeholder="e.g. 1" error={errors.Equipment} />
              <FormField label="Manufacturer ID" type="number" value={form.ManufactureId} onChange={v => updateField('ManufactureId', v)}
                required placeholder="e.g. 2" error={errors.ManufactureId} />
              <SelectField label="Bus ID" value={form.BusId} onChange={v => updateField('BusId', Number(v))}
                options={busOptions.map(b => ({ value: b.id, label: b.busId }))} required error={errors.BusId} />
              <FormField label="RT Address" value={form.RtAddress} onChange={v => updateField('RtAddress', v)}
                required placeholder="e.g. 01" error={errors.RtAddress} />
              <FormField label="ICD Version ID" value={form.IcdVersionId} onChange={v => updateField('IcdVersionId', v)}
                required placeholder="e.g. ICD-FCC-3.2" error={errors.IcdVersionId} />
              <FormField label="SW Version" value={form.SwVersion} onChange={v => updateField('SwVersion', v)}
                placeholder="e.g. 4.1.2" />
              <FormField label="Release Version" value={form.ReleaseVersion} onChange={v => updateField('ReleaseVersion', v)}
                placeholder="e.g. R4.1" />
              <FormField label="Amendment No." value={form.AmndNo} onChange={v => updateField('AmndNo', v)}
                placeholder="e.g. A03" />
              <SelectField label="Aircraft Type" value={form.AircraftType ?? ''} onChange={v => updateField('AircraftType', v ? Number(v) : undefined)}
                options={aircraftOptions.map(aircraft => ({ value: aircraft.id, label: aircraft.aircraftName }))} required error={errors.AircraftType} />
              <SelectField label="Guideline" value={form.GuidelineId ?? ''} onChange={v => updateField('GuidelineId', v ? Number(v) : undefined)}
                options={guidelineOptions.map(guideline => ({ value: guideline.id, label: guideline.guideline }))} required error={errors.GuidelineId} />
              <FormField label="Selected Programmes IDs" value={form.SelectedProgrammesId ?? ''} onChange={v => updateField('SelectedProgrammesId', v)}
                placeholder="Comma-delimited programme IDs" />
              <FormField label="Hardware Version" value={form.HardwareVersion ?? ''} onChange={v => updateField('HardwareVersion', v)}
                placeholder="e.g. HW-2.1" />
              <FormField label="Amendment Date" type="date" value={form.AmndDate ?? ''} onChange={v => updateField('AmndDate', v)} />
              <FormField label="File Name" value={form.FileName ?? ''} onChange={v => updateField('FileName', v)}
                placeholder="e.g. remote-terminal.pdf" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
              <FormField label="RT Note" value={form.RtNote} onChange={v => updateField('RtNote', v)}
                placeholder="Optional notes..." rows={3} />
              <FormField label="RT Remarks" value={form.RtRemarks} onChange={v => updateField('RtRemarks', v)}
                placeholder="Optional remarks..." rows={3} />
              <FormField label="Admin Remarks" value={form.AdminRemarks ?? ''} onChange={v => updateField('AdminRemarks', v)}
                placeholder="Administrative remarks..." rows={3} />
            </div>
            {view === 'edit' && selected && (
              <div style={{ marginTop: 20, padding: '10px 14px', background: 'var(--slate-50)', border: '1px solid var(--border)', borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Fields (read-only)</div>
                <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>ID: <strong>{selected.Id}</strong></span>
                  <span>Created: <strong>{new Date(selected.CreatedAt).toLocaleDateString()}</strong></span>
                  <span>By: <strong>{selected.CreatedBy}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // List view
  return (
    <div>
      <PageHeader
        title="Remote Terminal Maintenance"
        subtitle={`${data.length} remote terminals · SQL Server: Ada.dbo.RemoteTerminal`}
        actions={<>
          {/* <Button variant="secondary" size="sm" onClick={() => addToast('info', 'Export started — CSV will download shortly')}>⬇ Export</Button> */}
          <Button variant="primary" size="sm" onClick={openAdd}>+ Add Remote Terminal</Button>
        </>}
      />

      {/* Filter bar */}
      <div style={{
        padding: '10px 16px', background: '#fff', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search LRU, Equipment, Manf. ID..." />
        <select value={filterBus} onChange={e => { setFilterBus(e.target.value); setPage(1); }} style={{
          padding: '6px 10px', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)', fontSize: 12.5, background: '#fff',
        }}>
          <option value="">All Buses</option>
          {availableBusIds.map(busId => <option key={String(busId)} value={String(busId)}>{busName(busId)}</option>)}
        </select>
        {selectedRows.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedRows.size} selected</span>
            <Button variant="danger" size="sm" onClick={() => {
              setData(prev => prev.filter(r => !selectedRows.has(r.Id)));
              setSelectedRows(new Set());
              addToast('success', `${selectedRows.size} records deleted`);
            }}>Delete Selected</Button>
          </div>
        )}
        <span style={{ marginLeft: selectedRows.size ? 0 : 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <SectionCard style={{ margin: 16, marginTop: 12 }}>
        <div style={{
          minHeight: 320,
          maxHeight: 'calc(100vh - 230px)',
          overflow: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
                <th style={{ padding: '8px 12px', width: 32, position: 'sticky', top: 0, zIndex: 4, background: 'var(--slate-50)' }}>
                  <input type="checkbox" checked={selectedRows.size === pageData.length && pageData.length > 0}
                    onChange={toggleAll} />
                </th>
                {cols.map(col => {
                  const isPinned = col.key === 'Id' || col.key === 'LRU_Name';
                  return (
                  <th key={col.key} style={{
                    padding: '8px 12px', textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: col.width,
                    position: 'sticky',
                    top: 0,
                    left: col.key === 'Id' ? 0 : col.key === 'LRU_Name' ? 64 : undefined,
                    zIndex: isPinned ? 4 : 3,
                    background: 'var(--slate-50)',
                    boxShadow: col.key === 'LRU_Name' ? '2px 0 3px rgba(15, 23, 42, 0.08)' : undefined,
                  }}
                    onClick={() => toggleSort(col.key)}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {col.label}<SortIcon col={col.key} />
                    </span>
                  </th>
                  );
                })}
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', top: 0, zIndex: 3, background: 'var(--slate-50)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRows cols={cols.length + 2} />
              ) : pageData.length === 0 ? (
                <tr><td colSpan={cols.length + 2}>
                  <EmptyState message={emptyMessage} action={
                    <Button variant="primary" onClick={openAdd}>+ Add Remote Terminal</Button>
                  } />
                </td></tr>
              ) : pageData.map((rt, i) => (
                <tr key={rt.Id} style={{
                  borderBottom: '1px solid var(--border)',
                  background: selectedRows.has(rt.Id) ? '#eff6ff' : i % 2 === 0 ? '#fff' : 'var(--slate-50)',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { if (!selectedRows.has(rt.Id)) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!selectedRows.has(rt.Id)) (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : 'var(--slate-50)'; }}
                >
                  <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedRows.has(rt.Id)} onChange={() => toggleRow(rt.Id)} />
                  </td>
                  {cols.map(col => {
                    const value = rt[col.key];
                    const isCode = ['Id', 'ManufactureId', 'RtAddress', 'IcdVersionId', 'SwVersion', 'ReleaseVersion', 'AmndNo'].includes(col.key);
                    const isPinned = col.key === 'Id' || col.key === 'LRU_Name';
                    return (
                      <td key={col.key} style={{
                        padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap', fontFamily: isCode ? 'JetBrains Mono, monospace' : undefined,
                        position: isPinned ? 'sticky' : undefined,
                        left: col.key === 'Id' ? 0 : col.key === 'LRU_Name' ? 64 : undefined,
                        zIndex: isPinned ? 1 : undefined,
                        background: isPinned ? 'inherit' : undefined,
                        boxShadow: col.key === 'LRU_Name' ? '2px 0 3px rgba(15, 23, 42, 0.08)' : undefined,
                      }} onClick={() => openView(rt)}>
                        {col.key === 'LRU_Name' ? (
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--navy-700)' }}>{highlightMatch(rt.LRU_Name)}</span>
                        ) : col.key === 'BusId' ? (
                          <Badge variant="navy">{highlightMatch(busName(rt.BusId))}</Badge>
                        ) : ['Equipment', 'ManufactureId', 'RtAddress'].includes(col.key) ? (
                          highlightMatch(value)
                        ) : col.key === 'IsApproved' ? (
                          value === undefined ? '—' : value === 1 ? 'Yes' : 'No'
                        ) : value || '—'}
                      </td>
                    );
                  })}
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => openView(rt)}>View</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(rt)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={pageSize}
          onPage={setPage} onPageSize={n => { setPageSize(n); setPage(1); }} />
      </SectionCard>

      <ConfirmDelete open={deleteId !== null}
        name={data.find(r => r.Id === deleteId)?.LRU_Name ?? ''}
        onConfirm={() => handleDelete(deleteId!)}
        onCancel={() => setDeleteId(null)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
