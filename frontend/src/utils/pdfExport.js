import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a PDF report for MindPulse journal entries.
 * @param {Array} entries - The journal entries to export.
 * @param {string} username - Current user's username.
 * @param {string} email - Current user's email.
 */
export const generateJournalPDF = (entries, username, email) => {
  if (!Array.isArray(entries)) {
    throw new Error('Invalid data format: entries must be an array');
  }

  const doc = new jsPDF();
  
  // Branding & Header
  doc.setFontSize(22);
  doc.setTextColor(108, 92, 231); // MindPulse Primary Color
  doc.text('MindPulse Mental Health Report', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`User: ${username || 'Anonymous'}`, 14, 32);
  doc.text(`Email: ${email || 'N/A'}`, 14, 38);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 44);
  
  doc.setDrawColor(108, 92, 231);
  doc.line(14, 48, 196, 48);
  
  // Table Data Mapping
  const tableData = entries.map(entry => [
    entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A',
    (entry.mood_score || '0') + ' / 5',
    (entry.sentiment_label || 'Neutral').charAt(0).toUpperCase() + (entry.sentiment_label || 'neutral').slice(1),
    (entry.content || 'Voice Note/No Content').length > 100 
      ? (entry.content || '').substring(0, 100) + '...' 
      : (entry.content || 'Voice Note/No Content')
  ]);
  
  // Generate Table
  autoTable(doc, {
    startY: 55,
    head: [['Date', 'Mood', 'Sentiment', 'Journal Highlights']],
    body: tableData,
    headStyles: { 
      fillColor: [108, 92, 231], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 255] 
    },
    styles: { 
      fontSize: 10, 
      cellPadding: 5,
      valign: 'middle'
    },
    columnStyles: {
      3: { cellWidth: 80 } // Give more space to "Journal Highlights"
    }
  });
  
  // Footer / Page Numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`MindPulse_Report_${username || 'User'}_${Date.now()}.pdf`);
};

/**
 * Generates a PDF report and returns it as a base64 string.
 */
export const getJournalPDFBase64 = (entries, username, email) => {
  if (!Array.isArray(entries)) {
    throw new Error('Invalid data format: entries must be an array');
  }

  const doc = new jsPDF();
  
  // Branding & Header
  doc.setFontSize(22);
  doc.setTextColor(108, 92, 231);
  doc.text('MindPulse Mental Health Report', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`User: ${username || 'Anonymous'}`, 14, 32);
  doc.text(`Email: ${email || 'N/A'}`, 14, 38);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 44);
  
  doc.setDrawColor(108, 92, 231);
  doc.line(14, 48, 196, 48);
  
  const tableData = entries.map(entry => [
    entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A',
    (entry.mood_score || '0') + ' / 5',
    (entry.sentiment_label || 'Neutral').charAt(0).toUpperCase() + (entry.sentiment_label || 'neutral').slice(1),
    (entry.content || 'Voice Note/No Content').length > 100 
      ? (entry.content || '').substring(0, 100) + '...' 
      : (entry.content || 'Voice Note/No Content')
  ]);
  
  autoTable(doc, {
    startY: 55,
    head: [['Date', 'Mood', 'Sentiment', 'Journal Highlights']],
    body: tableData,
    headStyles: { fillColor: [108, 92, 231], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 3: { cellWidth: 80 } }
  });
  
  return doc.output('datauristring');
};
