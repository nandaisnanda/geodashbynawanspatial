
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, MapPin, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartAnalyticsProps {
  data: any[];
  dataType: string;
}

interface AttributeStats {
  min: number;
  max: number;
  mean: number;
  median: number;
}

interface TopValue {
  value: any;
  count: number;
  percentage: number;
}

interface AttributeAnalysis {
  type: 'numeric' | 'categorical' | 'text';
  uniqueValues: number;
  nullCount: number;
  stats?: AttributeStats;
  topValues?: TopValue[];
}

interface AnalysisResult {
  totalFeatures: number;
  spatialExtent: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
    center: [number, number];
  } | null;
  attributeAnalysis: {
    [key: string]: AttributeAnalysis;
  };
  insights: string[];
  recommendations: string[];
  dataQuality: {
    score: number;
    issues: string[];
    strengths: string[];
  };
}

const SmartAnalytics = ({ data, dataType }: SmartAnalyticsProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      performSmartAnalysis();
    }
  }, [data, dataType]);

  const performSmartAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Basic analysis
      const totalFeatures = data.length;
      
      // Spatial extent analysis
      let spatialExtent = null;
      if (dataType === 'csv') {
        const coords = extractCoordinates();
        if (coords.length > 0) {
          const lats = coords.map(c => c.lat);
          const lons = coords.map(c => c.lon);
          spatialExtent = {
            minLat: Math.min(...lats),
            maxLat: Math.max(...lats),
            minLon: Math.min(...lons),
            maxLon: Math.max(...lons),
            center: [
              (Math.min(...lats) + Math.max(...lats)) / 2,
              (Math.min(...lons) + Math.max(...lons)) / 2
            ]
          };
        }
      }

      // Attribute analysis
      const attributeAnalysis = analyzeAttributes();
      
      // Generate insights and recommendations
      const insights = generateInsights(attributeAnalysis, spatialExtent, totalFeatures);
      const recommendations = generateRecommendations(attributeAnalysis, dataType);
      
      // Data quality assessment
      const dataQuality = assessDataQuality(attributeAnalysis, totalFeatures);

      setAnalysis({
        totalFeatures,
        spatialExtent,
        attributeAnalysis,
        insights,
        recommendations,
        dataQuality
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractCoordinates = () => {
    const coords = [];
    data.forEach(row => {
      const headers = Object.keys(row).map(h => h.toLowerCase());
      const latCol = headers.find(h => ['latitude', 'lat', 'y'].includes(h));
      const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x'].includes(h));
      
      if (latCol && lonCol) {
        const lat = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === latCol)!]);
        const lon = parseFloat(row[Object.keys(row).find(k => k.toLowerCase() === lonCol)!]);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          coords.push({ lat, lon });
        }
      }
    });
    return coords;
  };

  const analyzeAttributes = (): { [key: string]: AttributeAnalysis } => {
    const attributes: { [key: string]: AttributeAnalysis } = {};
    const sampleData = dataType === 'csv' ? data : data.map(d => d.properties || {});
    
    if (sampleData.length === 0) return attributes;
    
    const allKeys = [...new Set(sampleData.flatMap(Object.keys))];
    
    allKeys.forEach(key => {
      const values = sampleData.map(row => row[key]).filter(val => val !== null && val !== undefined && val !== '');
      const nullCount = sampleData.length - values.length;
      const uniqueValues = new Set(values).size;
      
      // Determine data type
      const numericValues = values.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));
      const isNumeric = numericValues.length > values.length * 0.8 && numericValues.length > 0;
      
      let analysis: AttributeAnalysis = {
        type: isNumeric ? 'numeric' : (uniqueValues <= 10 ? 'categorical' : 'text'),
        uniqueValues,
        nullCount
      };

      if (isNumeric) {
        const sorted = numericValues.sort((a, b) => a - b);
        analysis.stats = {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          median: sorted[Math.floor(sorted.length / 2)]
        };
      } else if (analysis.type === 'categorical') {
        const valueCounts: { [key: string]: number } = {};
        values.forEach(val => {
          valueCounts[val] = (valueCounts[val] || 0) + 1;
        });
        
        analysis.topValues = Object.entries(valueCounts)
          .map(([value, count]) => ({
            value,
            count: count as number,
            percentage: (count as number / values.length) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }

      attributes[key] = analysis;
    });
    
    return attributes;
  };

  const generateInsights = (attributes: { [key: string]: AttributeAnalysis }, spatialExtent: any, totalFeatures: number) => {
    const insights = [];
    
    insights.push(`Dataset contains ${totalFeatures} features with ${Object.keys(attributes).length} attributes`);
    
    if (spatialExtent) {
      const latRange = spatialExtent.maxLat - spatialExtent.minLat;
      const lonRange = spatialExtent.maxLon - spatialExtent.minLon;
      insights.push(`Spatial coverage spans ${latRange.toFixed(2)}° latitude and ${lonRange.toFixed(2)}° longitude`);
    }
    
    const numericCols = Object.entries(attributes).filter(([_, attr]) => attr.type === 'numeric');
    if (numericCols.length > 0) {
      insights.push(`${numericCols.length} numeric attributes detected, suitable for statistical analysis`);
    }
    
    const categoricalCols = Object.entries(attributes).filter(([_, attr]) => attr.type === 'categorical');
    if (categoricalCols.length > 0) {
      insights.push(`${categoricalCols.length} categorical attributes found, ideal for classification analysis`);
    }
    
    // Check for patterns
    const highNullCols = Object.entries(attributes).filter(([_, attr]) => attr.nullCount > totalFeatures * 0.3);
    if (highNullCols.length > 0) {
      insights.push(`${highNullCols.length} attributes have significant missing data (>30%)`);
    }
    
    return insights;
  };

  const generateRecommendations = (attributes: { [key: string]: AttributeAnalysis }, dataType: string) => {
    const recommendations = [];
    
    const numericCols = Object.entries(attributes).filter(([_, attr]) => attr.type === 'numeric');
    if (numericCols.length >= 2) {
      recommendations.push('Consider correlation analysis between numeric variables');
      recommendations.push('Scatter plots could reveal interesting relationships');
    }
    
    const categoricalCols = Object.entries(attributes).filter(([_, attr]) => attr.type === 'categorical');
    if (categoricalCols.length > 0) {
      recommendations.push('Use categorical attributes for data segmentation and filtering');
    }
    
    if (dataType === 'csv') {
      recommendations.push('Consider spatial clustering analysis for point patterns');
    }
    
    const highVarianceCols = numericCols.filter(([_, attr]) => {
      const stats = attr.stats;
      return stats && (stats.max - stats.min) > stats.mean * 2;
    });
    
    if (highVarianceCols.length > 0) {
      recommendations.push('Some numeric attributes show high variance - consider outlier analysis');
    }
    
    return recommendations;
  };

  const assessDataQuality = (attributes: { [key: string]: AttributeAnalysis }, totalFeatures: number) => {
    const issues = [];
    const strengths = [];
    let score = 100;
    
    // Check for missing data
    const highNullCols = Object.entries(attributes).filter(([_, attr]) => attr.nullCount > totalFeatures * 0.2);
    if (highNullCols.length > 0) {
      issues.push(`${highNullCols.length} columns have >20% missing values`);
      score -= highNullCols.length * 10;
    } else {
      strengths.push('Low missing data rates across all attributes');
    }
    
    // Check attribute diversity
    if (Object.keys(attributes).length >= 5) {
      strengths.push('Rich attribute set with multiple variables');
    }
    
    // Check for numeric data
    const numericCount = Object.values(attributes).filter(attr => attr.type === 'numeric').length;
    if (numericCount >= 2) {
      strengths.push('Multiple numeric attributes enable statistical analysis');
    }
    
    // Feature count assessment
    if (totalFeatures >= 100) {
      strengths.push('Substantial dataset size for meaningful analysis');
    } else if (totalFeatures < 10) {
      issues.push('Small dataset size may limit analysis reliability');
      score -= 20;
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      strengths
    };
  };

  if (!data.length) return null;

  return (
    <Card className="shadow-lg border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Brain className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-gray-800 dark:text-gray-100">Smart Data Analytics</span>
          {isAnalyzing && <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {analysis && (
          <>
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Features</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analysis.totalFeatures}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Attributes</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{Object.keys(analysis.attributeAnalysis).length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Data Quality</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.dataQuality.score} className="w-20 h-2" />
                      <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analysis.dataQuality.score}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border-2 border-blue-200">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-900 dark:text-blue-100">
                <Brain className="h-5 w-5 text-blue-600" />
                Key Insights
              </h4>
              <div className="space-y-3">
                {analysis.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 shadow-sm">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-xl border-2 border-green-200">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-green-900 dark:text-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recommendations
              </h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Quality Details */}
            {(analysis.dataQuality.issues.length > 0 || analysis.dataQuality.strengths.length > 0) && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 p-6 rounded-xl border-2 border-gray-200">
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Data Quality Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.dataQuality.strengths.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Strengths</h5>
                      <div className="space-y-2">
                        {analysis.dataQuality.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 text-sm font-medium">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.dataQuality.issues.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">Issues</h5>
                      <div className="space-y-2">
                        {analysis.dataQuality.issues.map((issue, index) => (
                          <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 text-sm font-medium">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartAnalytics;
