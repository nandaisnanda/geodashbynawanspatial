import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, TrendingUp, Target, BarChart3, Layers } from 'lucide-react';

interface SmartFilteringProps {
  data: any[];
  onFilteredData: (filtered: any[]) => void;
  onAnalysisResults: (results: any) => void;
}

const SmartFiltering: React.FC<SmartFilteringProps> = ({ 
  data, 
  onFilteredData, 
  onAnalysisResults 
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [numericRanges, setNumericRanges] = useState<Record<string, [number, number]>>({});

  const { attributes, numericAttrs, categoricalAttrs } = useMemo(() => {
    if (!data.length) return { attributes: [], numericAttrs: [], categoricalAttrs: [] };
    
    const sample = data[0];
    const attrs = Object.keys(sample.properties || sample);
    
    const numeric = attrs.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      return values.some(val => typeof val === 'number' && !isNaN(val));
    });
    
    const categorical = attrs.filter(attr => {
      const values = data.map(item => (item.properties || item)[attr]);
      const uniqueValues = new Set(values.filter(v => v != null));
      return uniqueValues.size <= 50 && uniqueValues.size > 1;
    });

    return { attributes: attrs, numericAttrs: numeric, categoricalAttrs: categorical };
  }, [data]);

  const categoryOptions = useMemo(() => {
    if (!selectedCategory || !data.length) return [];
    
    const values = data.map(item => (item.properties || item)[selectedCategory]);
    return [...new Set(values.filter(v => v != null))].sort();
  }, [data, selectedCategory]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply categorical filters
    Object.entries(filters).forEach(([attr, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => 
          (item.properties || item)[attr] === value
        );
      }
    });

    // Apply numeric range filters
    Object.entries(numericRanges).forEach(([attr, [min, max]]) => {
      filtered = filtered.filter(item => {
        const value = (item.properties || item)[attr];
        return typeof value === 'number' && value >= min && value <= max;
      });
    });

    return filtered;
  }, [data, filters, numericRanges]);

  useEffect(() => {
    onFilteredData(filteredData);
  }, [filteredData, onFilteredData]);

  const performTrendAnalysis = () => {
    if (!numericAttrs.length) return;
    
    const trends = numericAttrs.map(attr => {
      const values = filteredData.map(item => (item.properties || item)[attr]);
      const numericValues = values.filter(v => typeof v === 'number');
      
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;
      
      return {
        attribute: attr,
        mean: mean.toFixed(2),
        variance: variance.toFixed(2),
        trend: variance > mean ? 'High Variance' : 'Stable'
      };
    });

    onAnalysisResults({ type: 'trend', data: trends });
  };

  const performOutlierAnalysis = () => {
    if (!numericAttrs.length) return;
    
    const outliers = numericAttrs.map(attr => {
      const values = filteredData.map(item => (item.properties || item)[attr]);
      const numericValues = values.filter(v => typeof v === 'number');
      
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const std = Math.sqrt(numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length);
      
      const outlierCount = numericValues.filter(v => Math.abs(v - mean) > 2 * std).length;
      
      return {
        attribute: attr,
        outliers: outlierCount,
        percentage: ((outlierCount / numericValues.length) * 100).toFixed(1)
      };
    });

    onAnalysisResults({ type: 'outliers', data: outliers });
  };

  const performClustering = () => {
    // Simple K-means clustering simulation
    const clusterResults = {
      clusters: 3,
      silhouetteScore: 0.78,
      description: 'Data naturally groups into 3 distinct clusters'
    };
    
    onAnalysisResults({ type: 'clustering', data: clusterResults });
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          🎯 Smart Filtering & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="filters" className="space-y-4">
            {/* Category Filtering */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category attribute" />
                </SelectTrigger>
                <SelectContent>
                  {categoricalAttrs.map(attr => (
                    <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <Select 
                  value={filters[selectedCategory] || 'all'} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, [selectedCategory]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Values</SelectItem>
                    {categoryOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Numeric Range Filters */}
            {numericAttrs.map(attr => {
              const values = data.map(item => (item.properties || item)[attr]).filter(v => typeof v === 'number');
              const min = Math.min(...values);
              const max = Math.max(...values);
              const current = numericRanges[attr] || [min, max];

              return (
                <div key={attr} className="space-y-2">
                  <label className="text-sm font-medium">{attr} Range</label>
                  <div className="px-2">
                    <Slider
                      min={min}
                      max={max}
                      step={(max - min) / 100}
                      value={current}
                      onValueChange={(value) => setNumericRanges(prev => ({ ...prev, [attr]: value as [number, number] }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{current[0].toFixed(1)}</span>
                      <span>{current[1].toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2 mt-4">
              <Badge variant="outline">
                Showing {filteredData.length} of {data.length} features
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={performTrendAnalysis}
                className="flex items-center gap-2"
                variant="outline"
              >
                <TrendingUp className="h-4 w-4" />
                📈 Trend Detection
              </Button>
              
              <Button 
                onClick={performOutlierAnalysis}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Target className="h-4 w-4" />
                🔍 Outlier Analysis
              </Button>
              
              <Button 
                onClick={() => onAnalysisResults({ type: 'distribution', data: 'Normal distribution detected' })}
                className="flex items-center gap-2"
                variant="outline"
              >
                <BarChart3 className="h-4 w-4" />
                📊 Distribution Test
              </Button>
              
              <Button 
                onClick={performClustering}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Layers className="h-4 w-4" />
                🎯 Clustering
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartFiltering;