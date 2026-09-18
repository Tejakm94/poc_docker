import { useState } from 'react';
import { Button, PageHeader, SectionCard, ToastContainer, useToasts } from '../components/UI';
import { API_BASE_URL, DB_RESTORE_API_KEY } from '../config';

type Operation = 'clear' | 'reset';

interface OperationResult {
  operation: Operation;
  success: boolean;
  message: string;
  timestamp: string;
}

const responseDetails = async (response: Response): Promise<{ message: string; status?: number }> => {
  const body = await response.text();
  if (!body) {
    return { message: response.ok ? 'The server completed the request.' : `Request failed (${response.status}).` };
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return {
      message: String(parsed.message ?? parsed.data ?? parsed.error ?? body),
      status: typeof parsed.status === 'number' ? parsed.status : undefined,
    };
  } catch {
    return { message: body };
  }
};

export default function DBGenerationPage() {
  const [loading, setLoading] = useState<Operation | null>(null);
  const [result, setResult] = useState<OperationResult | null>(null);
  const { toasts, addToast, removeToast } = useToasts();

  const runOperation = async (operation: Operation) => {
    if (operation === 'reset') {
      if (!DB_RESTORE_API_KEY) {
        addToast('error', 'Database restore is not configured.');
        return;
      }

      if (!window.confirm('This will delete the current database and restore the backup. Continue?')) {
        return;
      }
    }

    setLoading(operation);
    setResult(null);
    try {
      const response = operation === 'reset'
        ? await fetch(`${API_BASE_URL}/restoreDatabase`, {
            method: 'POST',
            headers: { 'x-restore-api-key': DB_RESTORE_API_KEY },
          })
        : await fetch(`${API_BASE_URL}/deleteSchema`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'clearAll' }),
          });
      const details = await responseDetails(response);
      const success = response.ok && (operation === 'clear' || details.status === 1);
      const message = details.message;
      setResult({ operation, success, message, timestamp: new Date().toLocaleString() });
      addToast(success ? 'success' : 'error', message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact the server.';
      setResult({ operation, success: false, message, timestamp: new Date().toLocaleString() });
      addToast('error', message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <PageHeader title="DB Generation" subtitle="Clear the current database or reset it from a database file" />
      <div style={{ padding: '24px', maxWidth: 960 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          <SectionCard>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Clear DB</div>
              <p style={{ margin: '5px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Removes the current database data using the server clear command.
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ padding: '10px 12px', marginBottom: 16, borderRadius: 4, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
                This operation changes server data. Confirm the server is ready before continuing.
              </div>
              <Button variant="danger" disabled={loading !== null} onClick={() => void runOperation('clear')}>
                {loading === 'clear' ? 'Clearing DB...' : 'Clear DB'}
              </Button>
            </div>
          </SectionCard>

          <SectionCard>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Reset DB</div>
              <p style={{ margin: '5px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Restore the database using the server restore operation.
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <Button variant="primary" disabled={loading !== null} onClick={() => void runOperation('reset')}>
                {loading === 'reset' ? 'Resetting DB...' : 'Reset DB'}
              </Button>
            </div>
          </SectionCard>
        </div>

        {result && (
          <SectionCard style={{ marginTop: 16, borderColor: result.success ? '#bbf7d0' : '#fecaca' }}>
            <div style={{ padding: '12px 16px', background: result.success ? '#f0fdf4' : '#fef2f2', color: result.success ? '#166534' : '#b91c1c' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{result.success ? 'Server operation completed' : 'Server operation failed'}</div>
              <div style={{ marginTop: 4, fontSize: 12 }}>{result.operation === 'clear' ? 'Clear DB' : 'Reset DB'} · {result.timestamp}</div>
            </div>
            <pre style={{ margin: 0, padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, fontFamily: 'inherit', color: 'var(--text-primary)' }}>{result.message}</pre>
          </SectionCard>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
