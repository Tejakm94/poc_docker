import { useState, useRef } from 'react';
import { Button, PageHeader, SectionCard, useToasts, ToastContainer } from '../components/UI';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
import { API_BASE_URL } from '../config';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PDF_IMPORT_API_URL = import.meta.env.VITE_PDF_IMPORT_API_URL || '/api/import-pdf';

interface ImportedRT {
  values: string[];
  valid: boolean;
  warning?: string;
}

interface ImportResult {
  status: number;
  message: string;
}

type PdfTextItem = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type TableRow = PdfTextItem[];

const Y_TOLERANCE = 3;
const COLUMN_TOLERANCE = 8;
const TEXT_FRAGMENT_GAP = 8;

const groupIntoRows = (items: PdfTextItem[]): TableRow[] => {
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) <= Y_TOLERANCE) return a.x - b.x;
    return a.y - b.y;
  });
  const rows: TableRow[] = [];

  for (const item of sorted) {
    const existingRow = rows.find(row => Math.abs(row[0].y - item.y) <= Y_TOLERANCE);
    if (existingRow) existingRow.push(item);
    else rows.push([item]);
  }

  rows.forEach(row => row.sort((a, b) => a.x - b.x));
  return rows;
};

const mergeAdjacentTextItems = (rows: TableRow[]): TableRow[] => rows.map(row => {
  const merged: TableRow = [];

  for (const item of row) {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ ...item });
      continue;
    }

    const gap = item.x - (previous.x + previous.width);
    if (gap <= TEXT_FRAGMENT_GAP) {
      previous. text = `${previous.text}${gap <= 1 ? '' : ' '}${item.text}`.trim();
      previous.width = Math.max(previous.width, item.x + item.width - previous.x);
    } else {
      merged.push({ ...item });
    }
  }

  return merged;
});

const detectColumnPositions = (rows: TableRow[]): number[] => {
  const positions: Array<{ x: number; count: number }> = [];

  for (const row of rows) {
    for (const item of row) {
      const existing = positions.find(position => Math.abs(position.x - item.x) <= COLUMN_TOLERANCE);
      if (existing) {
        existing.x = (existing.x * existing.count + item.x) / (existing.count + 1);
        existing.count += 1;
      } else {
        positions.push({ x: item.x, count: 1 });
      }
    }
  }

  const minimumCount = Math.max(2, Math.ceil(rows.length * 0.25));
  return positions
    .filter(position => position.count >= minimumCount)
    .map(position => position.x)
    .sort((a, b) => a - b);
};

const findHeaderItemRow = (rows: TableRow[]): number => {
  let bestIndex = -1;
  let bestScore = 0;

  rows.forEach((row, index) => {
    if (row.length < 2 || index === rows.length - 1) return;
    const rowText = row.map(item => item.text).join(' ');
    const letters = row.filter(item => /[a-z]/i.test(item.text));
    const numbers = row.filter(item => /\d/.test(item.text));
    const nextRowsHaveNumbers = rows.slice(index + 1, index + 4).some(nextRow => nextRow.some(item => /\d/.test(item.text)));
    const score = letters.length + (nextRowsHaveNumbers ? 3 : 0) - numbers.length * 2;

    if (letters.length >= 2 && numbers.length === 0 && nextRowsHaveNumbers && score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });

  return bestIndex;
};

const findFirstDataRow = (rows: TableRow[], headerIndex: number): number => {
  const dataIndex = rows.findIndex((row, index) => index > headerIndex && row.some(item => /\d/.test(item.text)));
  return dataIndex === -1 ? headerIndex + 1 : dataIndex;
};

const convertToTable = (rows: TableRow[], columnPositions: number[]): string[][] => rows.map(row => {
  const columns = new Array(columnPositions.length).fill('') as string[];

  for (const item of row) {
    let closestIndex = 0;
    let closestDistance = Infinity;

    columnPositions.forEach((columnX, index) => {
      const distance = Math.abs(item.x - columnX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    columns[closestIndex] = columns[closestIndex]
      ? `${columns[closestIndex]} ${item.text}`
      : item.text;
  }

  return columns.map(value => value.trim());
});

const removeEmptyColumns = (table: string[][]): string[][] => {
  const columnCount = Math.max(...table.map(row => row.length));
  const usedColumns = Array.from({ length: columnCount }, (_, index) => table.some(row => row[index]?.trim()));
  return table.map(row => row.filter((_, index) => usedColumns[index]));
};

const toApiFieldName = (header: string): string => header
  .trim()
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean)
  .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
  .join('');

const IMPORT_FIELD_ALIASES: Record<string, string[]> = {
  MessageNo: ['slno', 'serialno', 'serialnumber', 'messageno'],
  BlockId: ['blockid', 'block'],
  BusId: ['busid', 'bus'],
  Source: ['source'],
  Destination: ['destination', 'destn', 'dest'],
  WordCount: ['wordcount', 'noofwords', 'numberofwords', 'words'],
  Frequency: ['frequency', 'freq'],
  TxSubAddress: ['txsubaddress', 'txsub', 'txsubaddr'],
  RxSubAddress: ['rxsubaddress', 'rxsub', 'rxsubaddr'],
  MsgRemarks: ['msgremarks', 'remarks', 'remark'],
};

const IMPORT_DEFAULT_ROW: Record<string, string | number | null> = {
  LRU_Name: null,
  IcdVersionId: null,
  AmndNo: null,
  MessageName: null,
  MessageNo: null,
  MessageAliasName: null,
  MessageTypeId: null,
  MuxIdxId: null,
  MsgDescription: null,
  BlockId: null,
  BusId: null,
  Frequency: null,
  Source: null,
  Destination: null,
  RtAddress: null,
  WordCount: null,
  RxSubAddress: null,
  TxSubAddress: null,
  CmdWord: null,
  FramesId: 1,
  MsgRemarks: null,
  CreatedBy: 1,
  RemoteTableId: 'RTM01',
  Status: null,
  AliasDescription: null,
  approvedBy: null,
  AdminRemarks: null,
  MessageId: null,
  MuxPos: null,
  MuxStartBit: null,
  MuxEndBit: null,
};

const normalizeHeader = (header: string): string => header.toLowerCase().replace(/[^a-z0-9]/g, '');

const isLikelyTableDataRow = (row: string[], headers: string[]): boolean => {
  const populatedCellCount = row.filter(value => value.trim()).length;
  const serialNumberColumn = headers.findIndex(header =>
    IMPORT_FIELD_ALIASES.MessageNo.map(normalizeHeader).includes(normalizeHeader(header)),
  );

  // PDF text extraction also returns page footers (for example, "Sensitivity:")
  // after a table. A record must have the complete table shape and, when this
  // table has a serial-number column, a numeric serial-number value.
  if (populatedCellCount !== headers.length) return false;
  return serialNumberColumn === -1 || /^\d+$/.test(row[serialNumberColumn].trim());
};

const createImportRows = (headers: string[], rows: string[][]): Record<string, string | number | null>[] => {
  const fieldNames = headers.map(toApiFieldName);
  if (fieldNames.some(field => !field)) throw new Error('The PDF contains an empty table header');

  return rows.map(row => {
    const payload = { ...IMPORT_DEFAULT_ROW };
    Object.entries(IMPORT_FIELD_ALIASES).forEach(([payloadField, aliases]) => {
      const columnIndex = headers.findIndex(header => [payloadField, ...aliases]
        .map(normalizeHeader)
        .includes(normalizeHeader(header)));
      if (columnIndex === -1) return;

      const value = row[columnIndex]?.trim() || '';
      payload[payloadField] = value && /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value || null;
    });
    return payload;
  });
};

export default function PDFImportPage() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importedData, setImportedData] = useState<ImportedRT[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, removeToast } = useToasts();

  const extractPdfData = async (f: File) => {
    setStep(1);
    setExtractProgress(10);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setExtractProgress(100);
      const allPageRows: TableRow[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const items: PdfTextItem[] = [];

        content.items.forEach(item => {
          if (!('str' in item) || !('transform' in item)) return;
          if (!item.str.trim()) return;
          const transform = item.transform;
          items.push({
            text: item.str.trim(),
            x: transform[4],
            y: -transform[5],
            width: item.width || 0,
            height: item.height || Math.abs(transform[3]) || 10,
          });
        });

        allPageRows.push(...groupIntoRows(items));
        setExtractProgress(100);
      }

      if (allPageRows.length === 0) {
        throw new Error('No readable text was found in this PDF');
      }

      setExtractProgress(80);
      const headerItemRowIndex = findHeaderItemRow(allPageRows);
      if (headerItemRowIndex === -1) {
        throw new Error('Unable to automatically identify the table header');
      }

      const dataStartIndex = findFirstDataRow(allPageRows, headerItemRowIndex);
      const dataItemRows = mergeAdjacentTextItems(allPageRows.slice(dataStartIndex));
      const columnPositions = detectColumnPositions(dataItemRows);
      if (columnPositions.length < 2) {
        throw new Error('Unable to detect table columns in this PDF');
      }

      const headerRows = allPageRows.slice(headerItemRowIndex, dataStartIndex);
      const headerTable = convertToTable(headerRows, columnPositions);
      const dataTable = convertToTable(dataItemRows, columnPositions);
      const combinedTable = removeEmptyColumns([...headerTable, ...dataTable]);
      const detectedHeaders = combinedTable.slice(0, headerRows.length).reduce((headers, row) => (
        row.map((value, index) => `${headers[index] || ''} ${value}`.trim())
      ), [] as string[]);
      const detectedRows = combinedTable
        .slice(headerRows.length)
        .filter(row => isLikelyTableDataRow(row, detectedHeaders));
      if (!detectedHeaders.length || !detectedRows.length) {
        throw new Error('No table data was found after the detected header');
      }

      setExtractProgress(92);
      const importedRows = detectedRows.map(values => ({
        values,
        valid: values.length === detectedHeaders.length && values.every(value => value.trim()),
        warning: values.length === detectedHeaders.length && values.every(value => value.trim()) ? undefined : 'Required table data is missing',
      }));

      setExtractProgress(100);
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      createImportRows(detectedHeaders, detectedRows);
      setHeaders(detectedHeaders);
      setImportedData(importedRows);
    } catch (error) {
      setStep(0);
      addToast('error', error instanceof Error ? error.message : 'Unable to read this PDF');
    }
  };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.pdf')) { addToast('error', 'Only PDF files are accepted'); return; }
    setFile(f);
    setHeaders([]);
    setImportedData([]);
    setExtractProgress(0);
  };

  const handleReupload = () => {
    if (fileRef.current) fileRef.current.value = '';
    fileRef.current?.click();
  };

  const handleSave = async () => {
    try {
      const rows = createImportRows(headers, importedData.map(row => row.values));
      const requestBody = {
        headers: headers.map(toApiFieldName),
        rows,
      };
        const response = await fetch(`${API_BASE_URL}/importMessageMaintenance`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();

      if (!response.ok || responseData.status !== 1) {
        throw new Error(responseData.data || responseData.message || 'Unable to save imported PDF data');
      }

      const message = responseData.message || responseData.data || 'PDF table data saved successfully';
      const results: ImportResult[] = Array.isArray(responseData.results) ? responseData.results : [];
      addToast('success', message);
      results.forEach((result, index) => {
        if (result.status === 0) addToast('error', `Row ${index + 1}: ${result.message}`);
      });
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Unable to save imported PDF data');
    }
  };

  const validCount = importedData.filter(r => r.valid).length;
  const warningCount = importedData.filter(r => r.warning).length;
  const errorCount = importedData.filter(r => !r.valid).length;

  const reset = () => {
    setStep(0); setFile(null); setExtractProgress(0);
    setHeaders([]);
    setImportedData([]);
  };

  return (
    <div>
      <PageHeader title="PDF Import" subtitle="Extract ADA data from ICD PDF documents" />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Step 0: Upload */}
        {step === 0 && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <SectionCard style={{ padding: 32 }}>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--navy-500)' : file ? 'var(--accent-green)' : 'var(--border-strong)'}`,
                  borderRadius: 6, padding: '48px 32px', textAlign: 'center', cursor: 'pointer',
                  background: isDragging ? '#eff6ff' : file ? '#f0fdf4' : '#fff',
                  transition: 'all 0.2s',
                }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {file ? '✓' : '⊞'}
                </div>
                {file ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Drop PDF here or click to browse</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      Accepts ICD PDF documents (MIL-STD-1553, ARINC 429, CAN)
                    </div>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              {file && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--slate-50)', border: '1px solid var(--border)', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ready for extraction · PDF parser v2.4</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" onClick={handleReupload}>Re-upload PDF</Button>
                      <Button variant="primary" onClick={() => void extractPdfData(file)}>Read PDF Data →</Button>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {step === 1 && (
          <>
            {importedData.length === 0 ? (
              <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <SectionCard style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>⬡</div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Extracting ADA Data</h2>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 24 }}>Parsing {file?.name} · Identifying table data...</p>
                  <div style={{ background: 'var(--slate-200)', borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 12, border: extractProgress >= 100 ? '1px solid #16a34a' : '1px solid transparent' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: extractProgress >= 100 ? '#16a34a' : 'var(--navy-600)', width: `${Math.max(0, Math.min(extractProgress, 100))}%`, transition: 'width 0.3s ease, background 0.2s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(Math.min(extractProgress, 100))}%</span>
                </SectionCard>
              </div>
            ) : (
              <SectionCard>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>Extracted PDF Data</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" size="sm" onClick={() => setStep(0)}>← Back</Button>
                    <Button variant="primary" size="sm" disabled={errorCount > 0} onClick={handleSave}>
                      {errorCount > 0 ? `Fix ${errorCount} error(s) first` : `Save ${validCount} Records →`}
                    </Button>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-strong)' }}>
                      {[...headers, ''].map((header, index) => <th key={`${header}-${index}`} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10.5, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {importedData.map((row, rowIndex) => editingIdx === rowIndex ? (
                      <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border)', background: '#fffbeb' }}>
                        {row.values.map((value, columnIndex) => <td key={columnIndex} style={{ padding: '4px 8px' }}><input value={value} onChange={event => {
                          const updated = [...importedData];
                          const values = [...updated[rowIndex].values];
                          values[columnIndex] = event.target.value;
                          const valid = values.length === headers.length && values.every(column => column.trim());
                          updated[rowIndex] = { ...updated[rowIndex], values, valid, warning: valid ? undefined : 'Required table data is missing' };
                          setImportedData(updated);
                        }} style={{ width: '100%', padding: '4px 8px', border: '1px solid var(--navy-400)', borderRadius: 3, fontSize: 12 }} /></td>)}
                        <td style={{ padding: '4px 12px' }}><Button variant="primary" size="sm" onClick={() => setEditingIdx(null)}>Done</Button></td>
                      </tr>
                    ) : (
                      <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border)' }}>
                        {row.values.map((value, columnIndex) => <td key={columnIndex} style={{ padding: '8px 12px', fontSize: 12 }}>{value}</td>)}
                        <td style={{ padding: '8px 12px' }}><Button variant="ghost" size="sm" onClick={() => setEditingIdx(rowIndex)}>Edit</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importedData.some(row => row.warning) && <div style={{ padding: '8px 16px', background: '#fffbeb', fontSize: 12, color: '#b45309' }}>{importedData.map((row, index) => row.warning ? <div key={index}>⚠ Row {index + 1}: {row.warning}</div> : null)}</div>}
              </SectionCard>
            )}
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
