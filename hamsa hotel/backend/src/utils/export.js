import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export async function exportToExcel(dataArray, worksheetName = 'Sheet1') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetName);
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    worksheet.addRow(['No data']);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
  const headers = Object.keys(dataArray[0]);
  worksheet.addRow(headers);
  dataArray.forEach((row) => worksheet.addRow(headers.map((h) => row[h])));
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export function exportToPDF(dataArray, title = 'Report') {
  const doc = new PDFDocument({ margin: 30 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      doc.text('No data');
      doc.end();
      return;
    }
    const headers = Object.keys(dataArray[0]);
    doc.fontSize(12).text(headers.join(' | '));
    doc.moveDown(0.5);
    dataArray.forEach((row) => {
      doc.text(headers.map((h) => String(row[h] ?? '')).join(' | '));
    });
    doc.end();
  });
}

