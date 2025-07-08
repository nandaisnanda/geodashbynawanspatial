import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Activity, Download, RotateCcw } from 'lucide-react';

interface DynamicChartBuilderProps {
  data: any[];
  dataType: string;
}

const DynamicChartBuilder: React.FC<DynamicChartBuilderProps> = ({ data, dataType }) => {
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [groupBy, setGroupBy] = useState<string>('');

  const { attributes, numericAttrs, categoricalAttrs, chartData } = useMemo(() => {
    if (!data.length) return { attributes: [], numericAttrs: [], categoricalAttrs: [], chartData: [] };
    
    const sample = data[0];
    const attrs = Object.keys(sample.properties || sample);
    
    const numeric = attrs.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      return values.some(val => typeof val === 'number' && !isNaN(val));
    });
    
    const categorical = attrs.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      const uniqueValues = new Set(values.filter(v => v != null));
      return uniqueValues.size <= 20 && uniqueValues.size > 1;
    });

    // Prepare chart data
    const processed = data.slice(0, 100).map((item, index) => {
      const processedItem: any = { 
        index: index + 1, 
        name: `Item ${index + 1}`,
        id: item.id || index 
      };
      attrs.forEach(attr => {
        const value = (item.properties || item)[attr];
        processedItem[attr] = typeof value === 'number' ? value : (value || 'N/A');
      });
      return processedItem;
    });

    return { 
      attributes: attrs, 
      numericAttrs: numeric, 
      categoricalAttrs: categorical, 
      chartData: processed 
    };
  }, [data]);

  const aggregatedData = useMemo(() => {
    if (!groupBy || groupBy === 'none' || !yAxis || !chartData.length) return chartData;

    const grouped = chartData.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) {
        acc[key] = { [groupBy]: key, count: 0, sum: 0, values: [] };
      }
      acc[key].count += 1;
      if (typeof item[yAxis] === 'number') {
        acc[key].sum += item[yAxis];
        acc[key].values.push(item[yAxis]);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((group: any) => ({
      name: group[groupBy],
      value: group.count,
      average: group.values.length ? group.sum / group.values.length : 0,
      total: group.sum,
      count: group.count
    }));
  }, [chartData, groupBy, yAxis]);

  const chartColors = ['#0ea5e9', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

  const renderChart = () => {
    const dataToUse = groupBy ? aggregatedData : chartData;
    const xAxisKey = xAxis || 'name';
    const yAxisKey = yAxis || 'value';

    if (!dataToUse.length) return <div className="p-8 text-center text-muted-foreground">No data to display</div>;

    const commonProps = {
      data: dataToUse,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxisKey} stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yAxisKey} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill="#0ea5e9" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={dataToUse.slice(0, 8)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
            >
              {dataToUse.slice(0, 8).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid />
            <XAxis dataKey={xAxisKey} />
            <YAxis dataKey={yAxisKey} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter dataKey={yAxisKey} fill="#8b5cf6" />
          </ScatterChart>
        );

      case 'radar':
        const radarData = dataToUse.slice(0, 6).map(item => ({
          attribute: item[xAxisKey],
          value: typeof item[yAxisKey] === 'number' ? item[yAxisKey] : 0
        }));
        
        return (
          <RadarChart {...commonProps} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="attribute" />
            <PolarRadiusAxis />
            <Radar dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        );

      default:
        return <div className="p-8 text-center text-muted-foreground">Select chart type and axes</div>;
    }
  };

  const resetChart = () => {
    setXAxis('');
    setYAxis('');
    setGroupBy('');
    setChartType('bar');
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          📊 Dynamic Chart Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Chart Builder</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chart Type</label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                    <SelectItem value="radar">Radar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">X-Axis</label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select X-Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Item Name</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    {attributes.map(attr => (
                      <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Y-Axis</label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Y-Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericAttrs.map(attr => (
                      <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                    ))}
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Group By</label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categoricalAttrs.map(attr => (
                      <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetChart} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Badge variant="outline">
                {(groupBy ? aggregatedData : chartData).length} data points
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DynamicChartBuilder;