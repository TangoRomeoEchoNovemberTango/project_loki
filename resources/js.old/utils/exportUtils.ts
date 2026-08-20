/**
 * Utility functions for exporting application data (Leads, Title Companies, Buyers, Call Logs)
 * Adheres to DRY, KISS, and Separation of Concerns principles.
 */

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV<T extends Record<string, any>>(filename: string, data: T[], headers?: { key: keyof T; label: string }[]) {
  if (!data || data.length === 0) return;

  const keys = headers ? headers.map(h => h.key) : (Object.keys(data[0]) as (keyof T)[]);
  const labels = headers ? headers.map(h => h.label) : keys.map(k => String(k));

  const csvRows: string[] = [];

  // Header row
  csvRows.push(labels.map(l => `"${String(l).replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = keys.map(k => {
      const val = row[k];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${filename}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToJSON<T>(filename: string, data: T) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}
