// Utilidades simples de exportación sin dependencias externas
// - Excel: genera un CSV compatible con Excel (UTF-8 con BOM)
// - PDF: abre una ventana imprimible con la tabla para "Guardar como PDF"

function escapeCsv(value) {
  const v = value == null ? '' : String(value);
  const needsQuotes = /[",\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : `"${escaped}"`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

function detectCsvDelimiter() {
  try {
    const sample = (1.1).toLocaleString();
    // Si el separador decimal es coma, Excel suele usar ';' como separador de listas
    return sample.includes(',') ? ';' : ',';
  } catch (_) {
    return ',';
  }
}

export function exportToCSV(filename, headers, rows, options = {}) {
  // headers: [{ key, label }]
  // rows: array of plain objects with keys matching headers.key
  const delimiter = options.delimiter || detectCsvDelimiter();
  const headerLine = headers.map(h => escapeCsv(h.label)).join(delimiter);
  const bodyLines = (rows || []).map(r => headers.map(h => escapeCsv(r[h.key])).join(delimiter));
  // Pista para Excel: línea "sep=" define el separador a usar
  const lines = [`sep=${delimiter}`, headerLine, ...bodyLines];
  const csv = lines.join('\r\n');
  // Agregar BOM para mejorar compatibilidad con Excel
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
  const name = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  triggerDownload(blob, name);
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHTMLTable(headers, rows) {
  const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h.label)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${(rows || []).map(r => `<tr>${headers.map(h => `<td>${escapeHtml(r[h.key] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

export function exportToPrintablePDF(title, headers, rows, opts = {}) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Bloqueado por el navegador. Permite pop-ups para exportar.');
    return;
  }
  const styles = `
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; }
    h1 { font-size: 18px; margin: 0 0 12px 0; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f3f4f6; text-align: left; }
    th, td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 12px; }
    tr:nth-child(even) td { background: #fafafa; }
    @page { size: A4 landscape; margin: 14mm; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  `;
  const table = buildHTMLTable(headers, rows);
  const headerHtml = opts.headerHtml || '';
  const safeTitle = escapeHtml(title || 'Export');
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${safeTitle}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="no-print" style="display:flex; justify-content:flex-end; margin-bottom:8px; gap:8px;">
        <button onclick="window.print()" style="padding:6px 10px; border:1px solid #d1d5db; background:white; border-radius:6px;">Imprimir/Guardar PDF</button>
        <button onclick="window.close()" style="padding:6px 10px; border:1px solid #d1d5db; background:white; border-radius:6px;">Cerrar</button>
      </div>
      ${headerHtml}
      <h1>${safeTitle}</h1>
      ${table}
      <script>setTimeout(function(){ try{ window.print(); }catch(e){} }, 300);</script>
    </body>
  </html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// Opcional: pequeña ayuda para formato fecha dd/mm/yyyy
export function formatDate(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  } catch (_) {
    return '';
  }
}

const ExportUtils = { exportToCSV, exportToPrintablePDF, formatDate };
export default ExportUtils;
