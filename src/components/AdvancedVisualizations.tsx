
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Target, Zap, RotateCcw } from 'lucide-react';

interface AdvancedVisualizationsProps {
  data: any[];
  dataType: string;
}

const AdvancedVisualizations: React.FC<AdvancedVisualizationsProps> = ({ data, dataType }) => {
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string>('');

  const visualizationData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sample = data[0];
    const attributes = Object.keys(sample.properties || sample);
    const numericAttrs = attributes.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      return values.some(val => typeof val === 'number' && !isNaN(val));
    });
    
    const categoricalAttrs = attributes.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      const uniqueValues = new Set(values.filter(v => v != null));
      return uniqueValues.size <= Math.min(20, data.length * 0.5) && uniqueValues.size > 1;
    });

    // Prepare data for different chart types
    const chartData = data.slice(0, 50).map((item, index) => {
      const processedItem: any = { index: index + 1, name: `Item ${index + 1}` };
      [...numericAttrs, ...categoricalAttrs].forEach(attr => {
        const value = (item.properties || item)[attr];
        processedItem[attr] = typeof value === 'number' ? value : value || 0;
      });
      return processedItem;
    });

    // Statistical analysis
    const stats = numericAttrs.map(attr => {
      const values = data.map(item => (item.properties || item)[attr]).filter(val => typeof val === 'number' && !isNaN(val));
      if (values.length === 0) return null;
      
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      return {
        attribute: attr,
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }).filter(Boolean);

    // Enhanced correlation matrix
    const correlations: any[] = [];
    const allAttrs = [...numericAttrs, ...categoricalAttrs];
    
    for (let i = 0; i < allAttrs.length; i++) {
      for (let j = i + 1; j < allAttrs.length; j++) {
        const attr1 = allAttrs[i];
        const attr2 = allAttrs[j];
        
        const values1 = data.map(item => {
          const val = (item.properties || item)[attr1];
          return typeof val === 'number' ? val : 0;
        });
        const values2 = data.map(item => {
          const val = (item.properties || item)[attr2];
          return typeof val === 'number' ? val : 0;
        });
        
        if (values1.length === values2.length && values1.length > 1) {
          const mean1 = values1.reduce((a, b) => a + b) / values1.length;
          const mean2 = values2.reduce((a, b) => a + b) / values2.length;
          
          const num = values1.reduce((sum, val, idx) => sum + (val - mean1) * (values2[idx] - mean2), 0);
          const den1 = Math.sqrt(values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0));
          const den2 = Math.sqrt(values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0));
          
          const correlation = den1 * den2 ? num / (den1 * den2) : 0;
          
          correlations.push({
            pair: `${attr1} vs ${attr2}`,
            attr1,
            attr2,
            correlation: parseFloat(correlation.toFixed(3)),
            strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak',
            strengthValue: Math.abs(correlation)
          });
        }
      }
    }

    // Set default axes
    if (!selectedXAxis && allAttrs.length > 0) {
      setSelectedXAxis(allAttrs[0]);
    }
    if (!selectedYAxis && allAttrs.length > 1) {
      setSelectedYAxis(allAttrs[1]);
    }

    return { chartData, stats, correlations, numericAttrs, categoricalAttrs, allAttrs };
  }, [data, dataType]);

  if (!visualizationData) {
    return (
      <Card className="border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Advanced Visualizations
          </CardTitle>
          <CardDescription className="text-gray-600">
            No data available for visualization
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { chartData, stats, correlations, numericAttrs, categoricalAttrs, allAttrs } = visualizationData;
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  const getCorrelationColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm';
      case 'Moderate': return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-sm';
      default: return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 shadow-sm';
    }
  };

  const getCorrelationBadge = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'bg-green-600 text-white hover:bg-green-700';
      case 'Moderate': return 'bg-yellow-600 text-white hover:bg-yellow-700';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const refreshCharts = () => {
    if (allAttrs.length > 0) {
      setSelectedXAxis(allAttrs[0]);
      setSelectedYAxis(allAttrs.length > 1 ? allAttrs[1] : allAttrs[0]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-cyan-950/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                <div className="p-2 bg-purple-600 rounded-lg shadow-md">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                🚀 Advanced Data Visualizations
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mt-2">
                Interactive analysis of your {dataType} dataset with {data.length} features
              </CardDescription>
            </div>
            <Button onClick={refreshCharts} variant="outline" size="sm" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="trends" className="text-sm">Trends</TabsTrigger>
              <TabsTrigger value="distribution" className="text-sm">Distribution</TabsTrigger>
              <TabsTrigger value="relationships" className="text-sm">Relationships</TabsTrigger>
              <TabsTrigger value="advanced" className="text-sm">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieIcon className="h-5 w-5 text-purple-600" />
                      Data Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ attribute, mean }) => `${attribute}: ${mean}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="mean"
                        >
                          {stats.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Statistical Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.slice(0, 4).map((stat, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-semibold">{stat.attribute}</div>
                            <div className="text-sm text-muted-foreground">
                              Range: {stat.min} - {stat.max}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">μ = {stat.mean}</div>
                            <div className="text-sm text-muted-foreground">σ = {stat.stdDev}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {numericAttrs.slice(0, 3).map((attr, index) => (
                        <Line 
                          key={attr}
                          type="monotone" 
                          dataKey={attr} 
                          stroke={colors[index]} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bar Chart Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {numericAttrs.slice(0, 2).map((attr, index) => (
                          <Bar key={attr} dataKey={attr} fill={colors[index]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Area Chart Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {numericAttrs.slice(0, 2).map((attr, index) => (
                          <Area 
                            key={attr}
                            type="monotone" 
                            dataKey={attr} 
                            stackId="1"
                            stroke={colors[index]} 
                            fill={colors[index]}
                            fillOpacity={0.6}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="relationships" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border border-blue-200 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                      <Activity className="h-5 w-5 text-blue-600" />
                      🔗 Correlation Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Statistical relationships between variables with enhanced visualization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {correlations.length > 0 ? (
                        correlations
                          .sort((a, b) => b.strengthValue - a.strengthValue)
                          .map((corr, index) => (
                            <div 
                              key={index} 
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getCorrelationColor(corr.strength)}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate mb-2 text-gray-800">
                                  📊 {corr.attr1} × {corr.attr2}
                                </div>
                                <div className="text-xs text-gray-600 font-medium">
                                  Correlation Coefficient • {corr.strength} Relationship
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <Badge 
                                  className={`font-bold text-xs px-3 py-1 ${getCorrelationBadge(corr.strength)}`}
                                >
                                  {corr.strength.toUpperCase()}
                                </Badge>
                                <div className="text-right">
                                  <div className="font-mono text-xl font-bold text-gray-900">
                                    {corr.correlation}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {Math.abs(corr.correlation * 100).toFixed(1)}% strength
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">No Correlations Available</h3>
                          <p className="text-sm">Need numeric data for correlation analysis</p>
                          <p className="text-xs text-gray-400 mt-1">Upload data with numeric attributes to see correlations</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-green-200 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                      <Target className="h-5 w-5 text-green-600" />
                      Interactive Scatter Plot
                    </CardTitle>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">X-Axis</label>
                        <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select X variable" />
                          </SelectTrigger>
                          <SelectContent>
                            {allAttrs.map((attr) => (
                              <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Y-Axis</label>
                        <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select Y variable" />
                          </SelectTrigger>
                          <SelectContent>
                            {allAttrs.map((attr) => (
                              <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey={selectedXAxis} 
                          tick={{ fontSize: 10 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          dataKey={selectedYAxis} 
                          tick={{ fontSize: 10 }}
                          stroke="#6b7280"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Scatter 
                          dataKey={selectedYAxis} 
                          fill="#0ea5e9" 
                          stroke="#0284c7"
                          strokeWidth={1}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Radar Chart Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={stats.slice(0, 6)} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="attribute" />
                      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                      <Radar 
                        name="Mean Values" 
                        dataKey="mean" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar 
                        name="Standard Deviation" 
                        dataKey="stdDev" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedVisualizations;
