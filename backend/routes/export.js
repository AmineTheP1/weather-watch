import express from 'express';
import { query } from '../db/init.js';
import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import createCsvWriter from 'csv-writer';

const router = express.Router();

// Export to JSON
router.get('/json', async (req, res) => {
  try {
    const result = await query('SELECT * FROM weather_queries ORDER BY created_at DESC', []);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.json');
    res.json({ data: result.rows });
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export to XML
router.get('/xml', async (req, res) => {
  try {
    const result = await query('SELECT * FROM weather_queries ORDER BY created_at DESC', []);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<weather_queries>\n';
    
    result.rows.forEach(row => {
      xml += '  <query>\n';
      Object.keys(row).forEach(key => {
        const value = row[key] || '';
        xml += `    <${key}>${escapeXml(value)}</${key}>\n`;
      });
      xml += '  </query>\n';
    });
    
    xml += '</weather_queries>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.xml');
    res.send(xml);
  } catch (error) {
    console.error('XML export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export to CSV
router.get('/csv', async (req, res) => {
  try {
    const result = await query('SELECT * FROM weather_queries ORDER BY created_at DESC', []);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: Object.keys(result.rows[0]).map(key => ({ id: key, title: key }))
    });

    const csv = csvWriter.getHeaderString() + csvWriter.stringifyRecords(result.rows);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export to PDF
router.get('/pdf', async (req, res) => {
  try {
    const result = await query('SELECT * FROM weather_queries ORDER BY created_at DESC', []);
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.pdf');
    
    doc.pipe(res);
    
    doc.fontSize(20).text('Weather Queries Report', { align: 'center' });
    doc.moveDown();
    
    if (result.rows.length === 0) {
      doc.fontSize(12).text('No data available');
    } else {
      result.rows.forEach((row, index) => {
        doc.fontSize(14).text(`Query #${row.id}`, { underline: true });
        doc.fontSize(10);
        doc.text(`Location: ${row.location_name}`);
        doc.text(`Date Range: ${format(new Date(row.start_date), 'yyyy-MM-dd')} to ${format(new Date(row.end_date), 'yyyy-MM-dd')}`);
        doc.text(`Temperature: ${row.temperature}°C`);
        doc.text(`Description: ${row.description}`);
        doc.text(`Humidity: ${row.humidity}%`);
        doc.text(`Wind Speed: ${row.wind_speed} m/s`);
        doc.text(`Created: ${format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss')}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export to Markdown
router.get('/markdown', async (req, res) => {
  try {
    const result = await query('SELECT * FROM weather_queries ORDER BY created_at DESC', []);
    
    let markdown = '# Weather Queries Report\n\n';
    markdown += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    markdown += `Total Records: ${result.rows.length}\n\n`;
    markdown += '---\n\n';
    
    result.rows.forEach(row => {
      markdown += `## Query #${row.id}\n\n`;
      markdown += `- **Location:** ${row.location_name}\n`;
      markdown += `- **Date Range:** ${format(new Date(row.start_date), 'yyyy-MM-dd')} to ${format(new Date(row.end_date), 'yyyy-MM-dd')}\n`;
      markdown += `- **Temperature:** ${row.temperature}°C\n`;
      markdown += `- **Description:** ${row.description}\n`;
      markdown += `- **Humidity:** ${row.humidity}%\n`;
      markdown += `- **Wind Speed:** ${row.wind_speed} m/s\n`;
      markdown += `- **Created:** ${format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss')}\n`;
      markdown += `- **Updated:** ${format(new Date(row.updated_at), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
      markdown += '---\n\n';
    });
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=weather_data.md');
    res.send(markdown);
  } catch (error) {
    console.error('Markdown export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to escape XML
function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
