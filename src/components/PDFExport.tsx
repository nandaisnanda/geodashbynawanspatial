
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileDown, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExportProps {
  data?: any[];
  analysisData?: any;
}

const PDFExport = ({ data = [], analysisData }: PDFExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'A4',
    orientation: 'portrait',
    includeMap: true,
    includeCharts: true,
    includeTable: true,
    includeAnalytics: true,
    quality: 'high'
  });

  const exportToPDF = async () => {
    setIsExporting(true);
    toast.info('Generating professional PDF report...');

    try {
      const pdf = new jsPDF({
        orientation: exportOptions.orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: exportOptions.format.toLowerCase() as any
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Add title page
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Geodash Analytics Report', pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('by NawanSpatial', pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 30;
      pdf.setFontSize(12);
      const reportDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(`Generated on ${reportDate}`, pageWidth / 2, currentY, { align: 'center' });

      // Add executive summary
      if (analysisData) {
        currentY += 25;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Executive Summary', 20, currentY);
        
        currentY += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const summary = [
          `• Dataset contains ${data.length} features with comprehensive spatial and attribute data`,
          `• Data quality score: ${analysisData?.dataQuality?.score || 'N/A'}%`,
          `• ${Object.keys(analysisData?.attributeAnalysis || {}).length} attributes analyzed`,
          `• Generated ${analysisData?.insights?.length || 0} key insights and ${analysisData?.recommendations?.length || 0} recommendations`
        ];
        
        summary.forEach(line => {
          pdf.text(line, 25, currentY);
          currentY += 5;
        });
      }

      // Add new page for content
      pdf.addPage();
      currentY = 20;

      // Capture and add map
      if (exportOptions.includeMap) {
        await addSectionToPDF(pdf, 'map-section', 'Interactive Map Visualization', currentY);
        currentY += 120;
      }

      // Add charts section
      if (exportOptions.includeCharts) {
        const chartsElement = document.querySelector('[data-section="charts"]');
        if (chartsElement) {
          await addSectionToPDF(pdf, 'charts-section', 'Data Visualizations', currentY);
          if (currentY > pageHeight - 100) {
            pdf.addPage();
            currentY = 20;
          }
        }
      }

      // Add analytics section
      if (exportOptions.includeAnalytics && analysisData) {
        if (currentY > pageHeight - 150) {
          pdf.addPage();
          currentY = 20;
        }
        await addAnalyticsToPDF(pdf, analysisData, currentY);
      }

      // Add table as appendix if requested
      if (exportOptions.includeTable && data.length > 0) {
        pdf.addPage();
        addTableToPDF(pdf, data);
      }

      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        // Footer
        pdf.text(
          `Geodash by NawanSpatial - Professional Geospatial Analytics Platform`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        // Page number
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }

      // Save with descriptive filename
      const filename = `geodash-report-${new Date().toISOString().split('T')[0]}-${Date.now()}.pdf`;
      pdf.save(filename);
      
      toast.success('Professional PDF report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const addSectionToPDF = async (pdf: jsPDF, elementId: string, title: string, startY: number) => {
    const element = document.getElementById(elementId) || document.querySelector(`[data-section="${elementId}"]`);
    if (!element) return startY;

    // Hide export controls during capture
    const exportControls = document.querySelectorAll('.export-hidden');
    exportControls.forEach(el => el.classList.add('hidden'));

    try {
      const canvas = await html2canvas(element as HTMLElement, {
        height: element.scrollHeight,
        width: element.scrollWidth,
        useCORS: true,
        scale: exportOptions.quality === 'high' ? 2 : 1.5,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add section title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, startY);
      
      // Add image
      pdf.addImage(imgData, 'PNG', 20, startY + 10, imgWidth, Math.min(imgHeight, 150));
      
      return startY + Math.min(imgHeight, 150) + 20;
    } finally {
      // Restore hidden elements
      exportControls.forEach(el => el.classList.remove('hidden'));
    }
  };

  const addAnalyticsToPDF = async (pdf: jsPDF, analytics: any, startY: number) => {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Smart Analytics Summary', 20, startY);
    
    let currentY = startY + 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Key insights
    if (analytics.insights?.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights:', 20, currentY);
      currentY += 7;
      pdf.setFont('helvetica', 'normal');
      
      analytics.insights.forEach((insight: string) => {
        const lines = pdf.splitTextToSize(`• ${insight}`, 170);
        lines.forEach((line: string) => {
          pdf.text(line, 25, currentY);
          currentY += 5;
        });
      });
    }

    currentY += 5;

    // Recommendations
    if (analytics.recommendations?.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations:', 20, currentY);
      currentY += 7;
      pdf.setFont('helvetica', 'normal');
      
      analytics.recommendations.forEach((rec: string) => {
        const lines = pdf.splitTextToSize(`• ${rec}`, 170);
        lines.forEach((line: string) => {
          pdf.text(line, 25, currentY);
          currentY += 5;
        });
      });
    }

    return currentY;
  };

  const addTableToPDF = (pdf: jsPDF, data: any[]) => {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data Appendix', 20, 20);
    
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const maxRowsPerPage = 25;
    const startY = 35;
    let currentY = startY;

    // Table headers
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      pdf.text(header, 20 + (index * 25), currentY);
    });
    
    currentY += 7;
    pdf.setFont('helvetica', 'normal');

    // Table data
    data.slice(0, 100).forEach((row, rowIndex) => { // Limit to first 100 rows
      if (rowIndex > 0 && rowIndex % maxRowsPerPage === 0) {
        pdf.addPage();
        currentY = 20;
      }

      headers.forEach((header, colIndex) => {
        const value = String(row[header] || '').substring(0, 15); // Truncate long values
        pdf.text(value, 20 + (colIndex * 25), currentY);
      });
      
      currentY += 5;
    });

    if (data.length > 100) {
      currentY += 10;
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Note: Showing first 100 of ${data.length} records`, 20, currentY);
    }
  };

  return (
    <Card className="p-4 export-hidden">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Professional PDF Export</h3>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive reports with advanced analytics and visualizations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button 
              onClick={exportToPDF} 
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              {isExporting ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Format</label>
                <Select value={exportOptions.format} onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Orientation</label>
                <Select value={exportOptions.orientation} onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, orientation: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Include Sections</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'includeMap', label: 'Interactive Map' },
                  { key: 'includeCharts', label: 'Data Charts' },
                  { key: 'includeTable', label: 'Data Table' },
                  { key: 'includeAnalytics', label: 'Smart Analytics' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={exportOptions[key]}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                    <label htmlFor={key} className="text-sm">{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PDFExport;
