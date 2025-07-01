
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EyeOff, Eye, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface DataChartsProps {
  data: any[];
  dataType: string;
}

const DataCharts = ({ data, dataType }: DataChartsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [charts, setCharts] = useState<any[]>([]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  useEffect(() => {
    if (!data.length) return;

    let processedData = data;
    if (dataType !== 'csv') {
      processedData = data.map(feature => feature.properties || {});
    }

    const generatedCharts = generateAutomaticCharts(processedData);
    setCharts(generatedCharts);
  }, [data, dataType]);

  const generateAutomaticCharts = (data: any[]) => {
    if (!data.length) return [];

    const charts: any[] = [];
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow);

    // Identify numeric and categorical columns
    const numericColumns = columns.filter(col => {
      const values = data.map(row => row[col]).filter(val => val != null && val !== '');
      return values.length > 0 && values.every(val => !isNaN(parseFloat(val)));
    });

    const categoricalColumns = columns.filter(col => {
      const uniqueValues = [...new Set(data.map(row => row[col]).filter(val => val != null && val !== ''))];
      return uniqueValues.length > 1 && uniqueValues.length <= 10 && !numericColumns.includes(col);
    });

    // Generate bar charts for numeric data
    numericColumns.forEach(numericCol => {
      if (categoricalColumns.length > 0) {
        const categoryCol = categoricalColumns[0];
        const chartData = categoricalColumns.length > 0 ? 
          generateBarChartData(data, categoryCol, numericCol) :
          generateHistogramData(data, numericCol);
        
        if (chartData.length > 0) {
          charts.push({
            type: 'bar',
            title: `${numericCol} by ${categoryCol}`,
            data: chartData,
            xKey: 'category',
            yKey: 'value'
          });
        }
      }
    });

    // Generate pie charts for categorical data
    categoricalColumns.forEach(col => {
      const pieData = generatePieChartData(data, col);
      if (pieData.length > 0 && pieData.length <= 8) {
        charts.push({
          type: 'pie',
          title: `Distribution of ${col}`,
          data: pieData
        });
      }
    });

    return charts.slice(0, 4); // Limit to 4 charts
  };

  const generateBarChartData = (data: any[], categoryCol: string, valueCol: string) => {
    const grouped = data.reduce((acc, row) => {
      const category = row[categoryCol];
      const value = parseFloat(row[valueCol]);
      if (category && !isNaN(value)) {
        acc[category] = (acc[category] || 0) + value;
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, value]) => ({
      category,
      value
    }));
  };

  const generatePieChartData = (data: any[], column: string) => {
    const counts = data.reduce((acc, row) => {
      const value = row[column];
      if (value != null && value !== '') {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const generateHistogramData = (data: any[], column: string) => {
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 8;
    const binSize = (max - min) / bins;

    const histogram = Array(bins).fill(0);
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    return histogram.map((count, index) => ({
      category: `${(min + index * binSize).toFixed(1)}-${(min + (index + 1) * binSize).toFixed(1)}`,
      value: count
    }));
  };

  if (!isVisible) {
    return (
      <Card className="animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Data Charts</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsVisible(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show Charts
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
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Charts ({charts.length} charts)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsVisible(false)}
            className="flex items-center gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Hide Charts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {charts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart, index) => (
              <Card key={index} className="p-4">
                <CardTitle className="text-sm mb-4 flex items-center gap-2">
                  {chart.type === 'bar' ? (
                    <BarChart3 className="h-4 w-4" />
                  ) : (
                    <PieChartIcon className="h-4 w-4" />
                  )}
                  {chart.title}
                </CardTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey={chart.xKey} 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey={chart.yKey} fill="#0ea5e9" />
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chart.data}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {chart.data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No charts available. Upload data with numeric or categorical attributes to generate automatic visualizations.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataCharts;
