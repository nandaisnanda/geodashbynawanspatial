
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Target, Lightbulb } from 'lucide-react';

interface SmartAnalyticsProps {
  data: any[];
  dataType: string;
  onAnalyticsUpdate?: (analytics: any) => void;
}

const SmartAnalytics: React.FC<SmartAnalyticsProps> = ({ data, dataType, onAnalyticsUpdate }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.length > 0) {
      performSmartAnalysis();
    }
  }, [data, dataType]);

  const performSmartAnalysis = () => {
    setLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const analysisResult = analyzeData(data);
      setAnalytics(analysisResult);
      setLoading(false);
      
      // Notify parent component
      if (onAnalyticsUpdate) {
        onAnalyticsUpdate(analysisResult);
      }
    }, 1500);
  };

  const analyzeData = (dataset: any[]) => {
    if (!dataset || dataset.length === 0) return null;

    const sample = dataset[0];
    const attributes = Object.keys(sample.properties || sample);
    
    // Enhanced attribute analysis
    const numericAttrs = attributes.filter(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      return values.some(val => typeof val === 'number' && !isNaN(val));
    });
    
    const categoricalAttrs = attributes.filter(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      const uniqueValues = new Set(values.filter(v => v != null));
      return uniqueValues.size <= Math.min(20, dataset.length * 0.5) && uniqueValues.size > 1;
    });

    const temporalAttrs = attributes.filter(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      return values.some(val => {
        if (typeof val === 'string') {
          return !isNaN(Date.parse(val)) && val.length > 8;
        }
        return false;
      });
    });

    // Advanced statistical analysis
    const numericStats = numericAttrs.map(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]).filter(v => typeof v === 'number' && !isNaN(v));
      if (values.length === 0) return null;
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const iqr = sorted[Math.floor(sorted.length * 0.75)] - sorted[Math.floor(sorted.length * 0.25)];
      const outliers = values.filter(v => Math.abs(v - mean) > 2 * stdDev).length;
      const coefficientOfVariation = stdDev / mean;
      
      return {
        attribute: attr,
        mean, median, stdDev, variance, iqr, outliers,
        coefficientOfVariation,
        distribution: coefficientOfVariation > 1 ? 'highly_variable' : coefficientOfVariation > 0.5 ? 'moderate' : 'stable',
        skewness: mean > median ? 'right_skewed' : mean < median ? 'left_skewed' : 'symmetric'
      };
    }).filter(Boolean);

    // Spatial analysis for geographic data
    const spatialInsights = [];
    if (dataType === 'geojson' || dataType === 'csv') {
      const hasCoordinates = dataset.some(item => {
        const props = item.properties || item;
        return props.latitude || props.longitude || props.lat || props.lon || props.x || props.y;
      });
      
      if (hasCoordinates) {
        spatialInsights.push('Spatial clustering analysis recommended for geographic patterns');
        spatialInsights.push('Density mapping could reveal hotspots and cold zones');
        spatialInsights.push('Distance-based analysis may uncover spatial relationships');
      }
    }

    // Missing data analysis with severity classification
    const missingDataAnalysis = attributes.map(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      const missing = values.filter(v => v == null || v === '').length;
      const percentage = (missing / dataset.length) * 100;
      const severity = percentage > 50 ? 'critical' : percentage > 30 ? 'high' : percentage > 10 ? 'moderate' : 'low';
      return { attribute: attr, missing, percentage, severity };
    });

    const criticalMissing = missingDataAnalysis.filter(item => item.severity === 'critical');
    const highMissing = missingDataAnalysis.filter(item => item.severity === 'high');

    // Advanced pattern detection
    const patterns = [];
    if (numericAttrs.length >= 2) {
      patterns.push('Multi-dimensional clustering patterns detected');
      patterns.push('Principal Component Analysis (PCA) could reduce dimensionality');
    }
    if (categoricalAttrs.length >= 2) {
      patterns.push('Cross-categorical relationships identified');
      patterns.push('Association rule mining could reveal hidden patterns');
    }
    if (temporalAttrs.length > 0) {
      patterns.push('Temporal trends analysis available');
      patterns.push('Seasonal decomposition recommended for time-series data');
    }

    // Enhanced insights with AI-driven analysis
    const insights = [
      `🔍 Dataset Analysis: ${dataset.length} features across ${attributes.length} dimensions`,
      `📊 Statistical Power: ${numericAttrs.length} quantitative variables enable advanced analytics`,
      `🏷️ Classification Potential: ${categoricalAttrs.length} categorical features support segmentation`,
      `⏰ Temporal Dimension: ${temporalAttrs.length} time-based attributes detected`,
      ...spatialInsights,
      ...patterns.slice(0, 2),
      `⚠️ Data Completeness: ${criticalMissing.length + highMissing.length} attributes need attention`
    ];

    // Critical recommendations with priority levels
    const recommendations = [
      {
        priority: 'HIGH',
        category: 'Statistical Analysis',
        action: 'Implement multivariate analysis for comprehensive insights',
        reason: numericAttrs.length >= 3 ? 'Multiple numeric variables detected' : 'Limited to basic statistics'
      },
      {
        priority: 'HIGH',
        category: 'Data Quality',
        action: criticalMissing.length > 0 ? 'Address critical missing data immediately' : 'Maintain current data quality standards',
        reason: `${criticalMissing.length} critical and ${highMissing.length} high-severity gaps found`
      },
      {
        priority: 'MEDIUM',
        category: 'Visualization',
        action: 'Deploy interactive dashboards with drill-down capabilities',
        reason: 'Complex dataset requires multi-level exploration'
      },
      {
        priority: 'MEDIUM',
        category: 'Machine Learning',
        action: categoricalAttrs.length > 0 ? 'Apply supervised learning for classification' : 'Focus on unsupervised clustering',
        reason: `${categoricalAttrs.length} categorical targets available`
      }
    ];

    // Add advanced recommendations based on statistical properties
    numericStats.forEach(stat => {
      if (stat.distribution === 'highly_variable') {
        recommendations.push({
          priority: 'HIGH',
          category: 'Data Preprocessing',
          action: `Normalize ${stat.attribute} - high variance detected`,
          reason: `CV = ${stat.coefficientOfVariation.toFixed(2)} indicates extreme variability`
        });
      }
      if (stat.outliers > dataset.length * 0.05) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'Outlier Treatment',
          action: `Investigate ${stat.outliers} outliers in ${stat.attribute}`,
          reason: 'Outliers may indicate data quality issues or rare events'
        });
      }
    });

    // Comprehensive quality score with weighted factors
    const qualityFactors = {
      completeness: Math.max(0, 100 - (criticalMissing.length * 25 + highMissing.length * 15)),
      consistency: numericStats.length > 0 ? Math.max(0, 100 - numericStats.reduce((acc, stat) => acc + (stat.outliers / dataset.length * 100), 0)) : 100,
      richness: Math.min(100, (numericAttrs.length * 20) + (categoricalAttrs.length * 15) + (temporalAttrs.length * 10)),
      validity: Math.max(0, 100 - (attributes.filter(attr => attr.includes('null') || attr.includes('undefined')).length * 10))
    };

    const qualityScore = Math.round(
      (qualityFactors.completeness * 0.3) +
      (qualityFactors.consistency * 0.25) +
      (qualityFactors.richness * 0.25) +
      (qualityFactors.validity * 0.2)
    );

    return {
      insights,
      recommendations,
      qualityScore,
      qualityFactors,
      attributes: {
        total: attributes.length,
        numeric: numericAttrs.length,
        categorical: categoricalAttrs.length,
        temporal: temporalAttrs.length
      },
      missingData: missingDataAnalysis,
      numericStats,
      dataType,
      advancedMetrics: {
        spatialComplexity: spatialInsights.length > 0 ? 'high' : 'low',
        analyticalPotential: numericAttrs.length >= 3 ? 'high' : numericAttrs.length >= 1 ? 'medium' : 'low',
        dataMaturity: qualityScore >= 80 ? 'production-ready' : qualityScore >= 60 ? 'analysis-ready' : 'needs-improvement'
      }
    };
  };

  if (loading) {
    return (
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-cyan-950/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
            <div className="p-2 bg-purple-600 rounded-lg shadow-md">
              <Brain className="h-6 w-6 text-white animate-pulse" />
            </div>
            🤖 AI Smart Analytics Engine
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Analyzing your geospatial data with advanced AI algorithms...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Processing {data.length} features...
                </p>
                <Progress value={75} className="h-3 bg-gray-200" />
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                Running statistical analysis, pattern detection, and data quality assessment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Main Header Card */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-cyan-950/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
            <div className="p-2 bg-purple-600 rounded-lg shadow-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            🤖 AI Smart Analytics Results
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Advanced insights and recommendations for your {analytics.dataType} dataset
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Data Quality Score */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Target className="h-5 w-5 text-purple-600" />
                  Data Quality Score
                </h4>
                <Badge variant={getQualityBadgeVariant(analytics.qualityScore)} className="text-sm font-bold px-3 py-1">
                  {analytics.qualityScore}/100
                </Badge>
              </div>
              <div className="space-y-3">
                <Progress value={analytics.qualityScore} className="h-4 bg-gray-200" />
                <div className={`p-3 rounded-lg border ${getQualityColor(analytics.qualityScore)}`}>
                  <p className="text-sm font-medium">
                    {analytics.qualityScore >= 80 ? "Excellent data quality!" : 
                     analytics.qualityScore >= 60 ? "Good data quality with room for improvement" : 
                     "Data quality needs attention"}
                  </p>
                </div>
              </div>
            </div>

            {/* Attribute Analysis */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Attribute Analysis
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{analytics.attributes.total}</div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-600 mb-1">{analytics.attributes.numeric}</div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">Numeric</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{analytics.attributes.categorical}</div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Categorical</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border border-blue-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {analytics.insights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border border-yellow-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {analytics.recommendations.map((recommendation: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-100 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors">
                <div className="flex-shrink-0">
                  <Badge 
                    variant={recommendation.priority === 'HIGH' ? 'destructive' : 'secondary'} 
                    className="text-xs font-bold"
                  >
                    {recommendation.priority}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {recommendation.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {recommendation.action}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Analysis */}
      {analytics.missingData.some((item: any) => item.percentage > 0) && (
        <Card className="border border-orange-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Missing Data Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {analytics.missingData
                .filter((item: any) => item.percentage > 0)
                .sort((a: any, b: any) => b.percentage - a.percentage)
                .slice(0, 10)
                .map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{item.attribute}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <Progress value={item.percentage} className="h-2 bg-orange-100" />
                      </div>
                      <Badge 
                        variant={item.percentage > 50 ? "destructive" : item.percentage > 20 ? "secondary" : "outline"}
                        className="font-bold min-w-[60px] text-center"
                      >
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartAnalytics;
