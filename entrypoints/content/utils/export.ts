// Export utilities for calculator history ported from cursor-mate

export interface CalculationEntry {
  value: number;
  operation: string;
  timestamp?: Date;
  index: number;
}

export interface ExportData {
  entries: CalculationEntry[];
  total: number;
  currency: string;
  sessionDate: Date;
  operationCount: number;
}

/**
 * Export history to CSV format
 */
export function exportToCSV(data: ExportData): string {
  const headers = ['Index', 'Operation', 'Value', 'Currency', 'Timestamp'];
  const rows = data.entries.map(entry => [
    entry.index + 1,
    entry.operation,
    entry.value.toLocaleString(),
    data.currency,
    entry.timestamp?.toISOString() || new Date().toISOString()
  ]);
  
  // Add summary row
  rows.push(['', 'TOTAL', data.total.toLocaleString(), data.currency, '']);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Export history to JSON format
 */
export function exportToJSON(data: ExportData): string {
  const exportData = {
    session: {
      date: data.sessionDate.toISOString(),
      total: data.total,
      currency: data.currency,
      operationCount: data.operationCount
    },
    calculations: data.entries.map(entry => ({
      index: entry.index + 1,
      operation: entry.operation,
      value: entry.value,
      timestamp: entry.timestamp?.toISOString() || new Date().toISOString()
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Download file with given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Format calculation history for export
 */
export function formatHistoryForExport(
  history: Array<{ value: number; operation: string }>,
  total: number,
  currency: string = "₦"
): ExportData {
  return {
    entries: history.map((entry, index) => ({
      ...entry,
      index,
      timestamp: new Date()
    })),
    total,
    currency,
    sessionDate: new Date(),
    operationCount: history.length
  };
} 