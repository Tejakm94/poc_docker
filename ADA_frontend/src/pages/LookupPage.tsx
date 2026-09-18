import { useState } from 'react';
import { Button, Badge, PageHeader, SectionCard, Tabs, Modal, FormField, ConfirmDelete, useToasts, ToastContainer } from '../components/UI';
import { busList as initialBuses, messageTypes as initialTypes } from '../mockData';
import type { Bus, MessageType } from '../types';

export default function LookupPage() {
  const [tab, setTab] = useState('buses');
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const [types, setTypes] = useState<MessageType[]>(initialTypes);
  const [busModal, setBusModal] = useState(false);
  const [typeModal, setTypeModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editingType, setEditingType] = useState<MessageType | null>(null);
  const [busForm, setBusForm] = useState({ BusName: '', Description: '' });
  const [typeForm, setTypeForm] = useState({ TypeName: '', Description: '' });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'bus' | 'type'; id: number; name: string } | null>(null);
  const { toasts, addToast, removeToast } = useToasts();

  const openAddBus = () => { setEditingBus(null); setBusForm({ BusName: '', Description: '' }); setBusModal(true); };
  const openEditBus = (b: Bus) => { setEditingBus(b); setBusForm({ BusName: b.BusName, Description: b.Description }); setBusModal(true); };
  const saveBus = () => {
    if (!busForm.BusName.trim()) return;
    if (editingBus) {
      setBuses(prev => prev.map(b => b.BusId === editingBus.BusId ? { ...b, ...busForm } : b));
      addToast('success', `Bus "${busForm.BusName}" updated`);
    } else {
      const newId = Math.max(...buses.map(b => b.BusId)) + 1;
      setBuses(prev => [...prev, { BusId: newId, ...busForm }]);
      addToast('success', `Bus "${busForm.BusName}" added`);
    }
    setBusModal(false);
  };

  const openAddType = () => { setEditingType(null); setTypeForm({ TypeName: '', Description: '' }); setTypeModal(true); };
  const openEditType = (t: MessageType) => { setEditingType(t); setTypeForm({ TypeName: t.TypeName, Description: t.Description }); setTypeModal(true); };
  const saveType = () => {
    if (!typeForm.TypeName.trim()) return;
    if (editingType) {
      setTypes(prev => prev.map(t => t.MessageTypeId === editingType.MessageTypeId ? { ...t, ...typeForm } : t));
      addToast('success', `Type "${typeForm.TypeName}" updated`);
    } else {
      const newId = Math.max(...types.map(t => t.MessageTypeId)) + 1;
      setTypes(prev => [...prev, { MessageTypeId: newId, ...typeForm }]);
      addToast('success', `Type "${typeForm.TypeName}" added`);
    }
    setTypeModal(false);
  };

  return (
    <div>
      <PageHeader title="Lookup / Reference Data" subtitle="Bus List and Message Type reference tables" />

      <div style={{ padding: '0 16px' }}>
        <Tabs
          tabs={[
            { id: 'buses', label: 'Bus List', count: buses.length },
            { id: 'types', label: 'Message Types', count: types.length },
          ]}
          active={tab} onChange={setTab}
        />
      </div>

      <div style={{ padding: 16 }}>
        {tab === 'buses' && (
          <SectionCard>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Bus List <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· Ada.dbo.BusList</span></span>
              <Button variant="primary" size="sm" onClick={openAddBus}>+ Add Bus</Button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
                  {['Bus ID', 'Bus Name', 'Description', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: i === 3 ? 'right' : 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buses.map((b, i) => (
                  <tr key={b.BusId} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--slate-50)' }}>
                    <td style={{ padding: '9px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{b.BusId}</td>
                    <td style={{ padding: '9px 16px' }}>
                      <Badge variant="navy">{b.BusName}</Badge>
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>{b.Description}</td>
                    <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditBus(b)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ type: 'bus', id: b.BusId, name: b.BusName })}>Del</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {tab === 'types' && (
          <SectionCard>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Message Types <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· Ada.dbo.MessageType</span></span>
              <Button variant="primary" size="sm" onClick={openAddType}>+ Add Type</Button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
                  {['Type ID', 'Type Name', 'Description', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: i === 3 ? 'right' : 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {types.map((t, i) => (
                  <tr key={t.MessageTypeId} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--slate-50)' }}>
                    <td style={{ padding: '9px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{t.MessageTypeId}</td>
                    <td style={{ padding: '9px 16px' }}>
                      <Badge variant="info">{t.TypeName}</Badge>
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>{t.Description}</td>
                    <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditType(t)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ type: 'type', id: t.MessageTypeId, name: t.TypeName })}>Del</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}
      </div>

      {/* Bus modal */}
      <Modal open={busModal} title={editingBus ? 'Edit Bus' : 'Add Bus'} onClose={() => setBusModal(false)}
        width={440}
        footer={<>
          <Button variant="secondary" onClick={() => setBusModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveBus}>Save</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Bus Name" value={busForm.BusName} onChange={v => setBusForm(f => ({ ...f, BusName: v }))} required placeholder="e.g. BUS-A" />
          <FormField label="Description" value={busForm.Description} onChange={v => setBusForm(f => ({ ...f, Description: v }))} placeholder="e.g. Primary MIL-STD-1553 Bus A" rows={2} />
        </div>
      </Modal>

      {/* Type modal */}
      <Modal open={typeModal} title={editingType ? 'Edit Message Type' : 'Add Message Type'} onClose={() => setTypeModal(false)}
        width={440}
        footer={<>
          <Button variant="secondary" onClick={() => setTypeModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveType}>Save</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Type Name" value={typeForm.TypeName} onChange={v => setTypeForm(f => ({ ...f, TypeName: v }))} required placeholder="e.g. BC-RT" />
          <FormField label="Description" value={typeForm.Description} onChange={v => setTypeForm(f => ({ ...f, Description: v }))} placeholder="e.g. Bus Controller to Remote Terminal" rows={2} />
        </div>
      </Modal>

      <ConfirmDelete
        open={deleteTarget !== null}
        name={deleteTarget?.name ?? ''}
        onConfirm={() => {
          if (deleteTarget?.type === 'bus') {
            setBuses(prev => prev.filter(b => b.BusId !== deleteTarget.id));
            addToast('success', `Bus "${deleteTarget.name}" deleted`);
          } else if (deleteTarget?.type === 'type') {
            setTypes(prev => prev.filter(t => t.MessageTypeId !== deleteTarget.id));
            addToast('success', `Type "${deleteTarget.name}" deleted`);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
