
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Target, Zap } from 'lucide-react';

interface AdvancedVisualizationsProps {
  data: any[];
  dataType: string;
}

const AdvancedVisualizations: React.FC<AdvancedVisualizationsProps> = ({ data, dataType }) => {
  const visualizationData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sample = data[0];
    const attributes = Object.keys(sample.properties || sample);
    const numericAttrs = attributes.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      return values.some(val => typeof val === 'number' && !isNaN(val));
    });

    if (numericAttrs.length === 0) return null;

    // Prepare data for different chart types
    const chartData = data.slice(0, 20).map((item, index) => {
      const processedItem: any = { index: index + 1, name: `Item ${index + 1}` };
      numericAttrs.forEach(attr => {
        const value = (item.properties || item)[attr];
        processedItem[attr] = typeof value === 'number' ? value : 0;
      });
      return processedItem;
    });

    // Statistical analysis
    const stats = numericAttrs.map(attr => {
      const values = data.map(item => (item.properties || item)[attr]).filter(val => typeof val === 'number' && !isNaN(val));
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
    });

    // Correlation matrix (simplified)
    const correlations: any[] = [];
    for (let i = 0; i < numericAttrs.length; i++) {
      for (let j = i + 1; j < numericAttrs.length; j++) {
        const attr1 = numericAttrs[i];
        const attr2 = numericAttrs[j];
        
        const values1 = data.map(item => (item.properties || item)[attr1]).filter(val => typeof val === 'number');
        const values2 = data.map(item => (item.properties || item)[attr2]).filter(val => typeof val === 'number');
        
        if (values1.length === values2.length && values1.length > 1) {
          const mean1 = values1.reduce((a, b) => a + b) / values1.length;
          const mean2 = values2.reduce((a, b) => a + b) / values2.length;
          
          const num = values1.reduce((sum, val, idx) => sum + (val - mean1) * (values2[idx] - mean2), 0);
          const den1 = Math.sqrt(values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0));
          const den2 = Math.sqrt(values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0));
          
          const correlation = den1 * den2 ? num / (den1 * den2) : 0;
          
          correlations.push({
            pair: `${attr1} vs ${attr2}`,
            correlation: parseFloat(correlation.toFixed(3)),
            strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak'
          });
        }
      }
    }

    return { chartData, stats, correlations, numericAttrs };
  }, [data, dataType]);

  if (!visualizationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Visualizations
          </CardTitle>
          <CardDescription>
            No numeric data available for visualization
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { chartData, stats, correlations, numericAttrs } = visualizationData;
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#ff0080'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            🚀 Advanced Data Visualizations
          </CardTitle>
          <CardDescription>
            Comprehensive visual analysis of your {dataType} dataset with {data.length} features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scatter Plot Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={chartData}>
                        <CartesianGrid />
                        <XAxis dataKey={numericAttrs[0]} />
                        <YAxis dataKey={numericAttrs[1] || numericAttrs[0]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter dataKey={numericAttrs[1] || numericAttrs[0]} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Correlation Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {correlations.slice(0, 5).map((corr, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-medium text-sm">{corr.pair}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              corr.strength === 'Strong' ? 'default' : 
                              corr.strength === 'Moderate' ? 'secondary' : 'outline'
                            }>
                              {corr.strength}
                            </Badge>
                            <span className="font-mono text-sm">{corr.correlation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
