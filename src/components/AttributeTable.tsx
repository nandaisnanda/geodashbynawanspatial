
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface AttributeTableProps {
  data: any[];
  dataType: string;
  onDataUpdate: (updatedData: any[]) => void;
}

const AttributeTable = ({ data, dataType, onDataUpdate }: AttributeTableProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!data.length) return;

    let processedData: any[] = [];
    let allColumns: Set<string> = new Set();

    if (dataType === 'csv') {
      processedData = data;
      data.forEach(row => {
        Object.keys(row).forEach(key => allColumns.add(key));
      });
    } else {
      // GeoJSON or Shapefile
      processedData = data.map((feature, index) => ({
        id: index,
        geometry_type: feature.geometry?.type || 'Unknown',
        ...feature.properties
      }));
      
      processedData.forEach(row => {
        Object.keys(row).forEach(key => allColumns.add(key));
      });
    }

    setTableData(processedData);
    setColumns(Array.from(allColumns));
  }, [data, dataType]);

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const updatedData = [...tableData];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [column]: value
    };
    
    setTableData(updatedData);
    onDataUpdate(updatedData);
    
    // Debounced save notification
    setTimeout(() => {
      toast.success('Changes saved to cloud');
    }, 500);
  };

  if (!isVisible) {
    return (
      <Card className="animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Attribute Table</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsVisible(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show Table
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Attribute Table ({tableData.length} records)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsVisible(false)}
            className="flex items-center gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Hide Table
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tableData.length > 0 ? (
          <div className="overflow-auto max-h-96 border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={column}
                      className="px-4 py-3 text-left font-medium text-muted-foreground border-b border-border min-w-32"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className="hover:bg-muted/50 transition-colors border-b border-border/50"
                  >
                    {columns.map((column) => (
                      <td key={column} className="px-4 py-3">
                        <Input
                          value={row[column] || ''}
                          onChange={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                          className="border-0 bg-transparent p-1 h-auto focus:bg-background focus:border-border"
                          onFocus={(e) => e.target.select()}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No data available. Upload a file to view the attribute table.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttributeTable;
