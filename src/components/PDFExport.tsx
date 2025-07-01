
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    toast.info('Generating PDF report...');

    try {
      const dashboard = document.getElementById('dashboard-content');
      if (!dashboard) {
        throw new Error('Dashboard content not found');
      }

      // Hide export button and other UI elements during capture
      const elementsToHide = document.querySelectorAll('.export-hidden');
      elementsToHide.forEach(el => el.classList.add('hidden'));

      const canvas = await html2canvas(dashboard, {
        height: dashboard.scrollHeight,
        width: dashboard.scrollWidth,
        useCORS: true,
        scale: 1.5,
        logging: false
      });

      // Restore hidden elements
      elementsToHide.forEach(el => el.classList.remove('hidden'));

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.text('Geodash Report by NawanSpatial', pdfWidth / 2, 15, { align: 'center' });

      // Add main content
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Add footer
      pdf.setFontSize(8);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} - Geodash by NawanSpatial`,
        pdfWidth / 2,
        pdfHeight - 5,
        { align: 'center' }
      );

      pdf.save(`geodash-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-4 export-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Export Report</h3>
          <p className="text-sm text-muted-foreground">
            Generate a professional PDF report with all visualizations
          </p>
        </div>
        <Button 
          onClick={exportToPDF} 
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          {isExporting ? 'Generating...' : 'Export PDF'}
        </Button>
      </div>
    </Card>
  );
};

export default PDFExport;
