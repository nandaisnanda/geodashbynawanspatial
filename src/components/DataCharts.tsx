import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { EyeOff, Eye, BarChart3, PieChart as PieChartIcon, TrendingUp, Activity } from 'lucide-react';

interface DataChartsProps {
  data: any[];
  dataType: string;
}

const DataCharts = ({ data, dataType }: DataChartsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [charts, setCharts] = useState<any[]>([]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  useEffect(() => {
    if (!data.length) return;

    let processedData = data;
    if (dataType !== 'csv') {
      processedData = data.map(feature => feature.properties || {});
    }

    const generatedCharts = generateAdvancedCharts(processedData);
    setCharts(generatedCharts);
  }, [data, dataType]);

  const generateAdvancedCharts = (data: any[]) => {
    if (!data.length) return [];

    const charts: any[] = [];
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow);

    // Identify numeric and categorical columns with better detection
    const numericColumns = columns.filter(col => {
      const values = data.map(row => row[col]).filter(val => val != null && val !== '');
      if (values.length === 0) return false;
      
      const numericValues = values.filter(val => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)));
      return numericValues.length > values.length * 0.7; // At least 70% numeric
    });

    const categoricalColumns = columns.filter(col => {
      const uniqueValues = [...new Set(data.map(row => row[col]).filter(val => val != null && val !== ''))];
      return uniqueValues.length > 1 && uniqueValues.length <= 12 && !numericColumns.includes(col);
    });

    // Generate correlation matrix for numeric variables
    if (numericColumns.length >= 2) {
      const correlationData = generateCorrelationChart(data, numericColumns.slice(0, 2));
      if (correlationData.length > 0) {
        charts.push({
          type: 'scatter',
          title: `${numericColumns[0]} vs ${numericColumns[1]} Correlation`,
          data: correlationData,
          xKey: 'x',
          yKey: 'y'
        });
      }
    }

    // Generate distribution charts for numeric data
    numericColumns.slice(0, 2).forEach(numericCol => {
      const distributionData = generateDistributionChart(data, numericCol);
      if (distributionData.length > 0) {
        charts.push({
          type: 'bar',
          title: `Distribution of ${numericCol}`,
          data: distributionData,
          xKey: 'range',
          yKey: 'count'
        });
      }
    });

    // Generate cross-tabulation charts
    if (categoricalColumns.length >= 2 && numericColumns.length >= 1) {
      const crossTabData = generateCrossTabChart(data, categoricalColumns[0], numericColumns[0]);
      if (crossTabData.length > 0) {
        charts.push({
          type: 'bar',
          title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
          data: crossTabData,
          xKey: 'category',
          yKey: 'value'
        });
      }
    }

    // Generate pie charts for categorical data
    categoricalColumns.slice(0, 2).forEach(col => {
      const pieData = generateEnhancedPieChart(data, col);
      if (pieData.length > 0 && pieData.length <= 10) {
        charts.push({
          type: 'pie',
          title: `Distribution of ${col}`,
          data: pieData
        });
      }
    });

    // Generate time series if date column exists
    const dateColumns = columns.filter(col => 
      data.some(row => !isNaN(Date.parse(row[col])))
    );
    
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const timeSeriesData = generateTimeSeriesChart(data, dateColumns[0], numericColumns[0]);
      if (timeSeriesData.length > 0) {
        charts.push({
          type: 'line',
          title: `${numericColumns[0]} Over Time`,
          data: timeSeriesData,
          xKey: 'date',
          yKey: 'value'
        });
      }
    }

    return charts.slice(0, 6); // Limit to 6 charts for performance
  };

  const generateCorrelationChart = (data: any[], columns: string[]) => {
    return data.map(row => ({
      x: parseFloat(row[columns[0]]) || 0,
      y: parseFloat(row[columns[1]]) || 0
    })).filter(point => !isNaN(point.x) && !isNaN(point.y));
  };

  const generateDistributionChart = (data: any[], column: string) => {
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(values.length))));
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex]++;
    });

    return bins.map((count, index) => ({
      range: `${(min + index * binSize).toFixed(1)}-${(min + (index + 1) * binSize).toFixed(1)}`,
      count
    }));
  };

  const generateCrossTabChart = (data: any[], categoryCol: string, valueCol: string) => {
    const grouped = data.reduce((acc, row) => {
      const category = row[categoryCol];
      const value = parseFloat(row[valueCol]);
      if (category && !isNaN(value)) {
        if (!acc[category]) acc[category] = [];
        acc[category].push(value);
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, values]: [string, number[]]) => ({
      category,
      value: values.reduce((sum, val) => sum + val, 0) / values.length // Average
    }));
  };

  const generateEnhancedPieChart = (data: any[], column: string) => {
    const counts = data.reduce((acc, row) => {
      const value = row[column];
      if (value != null && value !== '') {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  };

  const generateTimeSeriesChart = (data: any[], dateCol: string, valueCol: string) => {
    return data
      .map(row => ({
        date: new Date(row[dateCol]).toLocaleDateString(),
        value: parseFloat(row[valueCol]) || 0
      }))
      .filter(item => !isNaN(new Date(item.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (!isVisible) {
    return (
      <Card className="animate-slide-up shadow-lg border-2 border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Advanced Data Visualizations</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsVisible(true)}
              className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
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
    <Card className="animate-slide-up shadow-lg border-2 border-indigo-100">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-3 font-bold text-indigo-900 dark:text-indigo-100">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Advanced Data Visualizations ({charts.length} charts)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsVisible(false)}
            className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <EyeOff className="h-4 w-4" />
            Hide Charts
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {charts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {charts.map((chart, index) => (
              <Card key={index} className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 shadow-md">
                <div className="mb-6">
                  <CardTitle className="text-lg mb-2 flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200">
                    {chart.type === 'bar' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                    {chart.type === 'pie' && <PieChartIcon className="h-5 w-5 text-green-600" />}
                    {chart.type === 'line' && <TrendingUp className="h-5 w-5 text-purple-600" />}
                    {chart.type === 'scatter' && <Activity className="h-5 w-5 text-orange-600" />}
                    {chart.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {chart.data.length} data points • {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                  </p>
                </div>
                <div className="h-80 border rounded-lg bg-white dark:bg-gray-800 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey={chart.xKey}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                        <Bar 
                          dataKey={chart.yKey} 
                          fill={COLORS[index % COLORS.length]} 
                          radius={[4, 4, 0, 0]}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={1}
                        />
                      </BarChart>
                    ) : chart.type === 'pie' ? (
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={chart.data}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                          stroke="#fff"
                          strokeWidth={2}
                        >
                          {chart.data.map((entry: any, idx: number) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                      </PieChart>
                    ) : chart.type === 'line' ? (
                      <LineChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey={chart.xKey} 
                          tick={{ fontSize: 11, fontWeight: 500 }} 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 11, fontWeight: 500 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                        <Line 
                          type="monotone" 
                          dataKey={chart.yKey} 
                          stroke={COLORS[index % COLORS.length]} 
                          strokeWidth={3}
                          dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                        />
                      </LineChart>
                    ) : chart.type === 'scatter' ? (
                      <ScatterChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey={chart.xKey} 
                          tick={{ fontSize: 11, fontWeight: 500 }} 
                          type="number"
                        />
                        <YAxis 
                          dataKey={chart.yKey} 
                          tick={{ fontSize: 11, fontWeight: 500 }} 
                          type="number"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                        <Scatter 
                          fill={COLORS[index % COLORS.length]} 
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={1}
                        />
                      </ScatterChart>
                    ) : null}
                  </ResponsiveContainer>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-6 opacity-50" />
            <p className="text-xl font-semibold mb-3">No charts available</p>
            <p className="text-base">Upload data with numeric or categorical attributes to generate automatic visualizations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataCharts;
