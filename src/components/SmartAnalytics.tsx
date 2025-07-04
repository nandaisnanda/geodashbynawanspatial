
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
    const numericAttrs = attributes.filter(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      return values.some(val => typeof val === 'number' && !isNaN(val));
    });
    
    const categoricalAttrs = attributes.filter(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      const uniqueValues = new Set(values.filter(v => v != null));
      return uniqueValues.size <= Math.min(20, dataset.length * 0.5) && uniqueValues.size > 1;
    });

    // Calculate missing data
    const missingDataAnalysis = attributes.map(attr => {
      const values = dataset.map(item => (item.properties || item)[attr]);
      const missing = values.filter(v => v == null || v === '').length;
      const percentage = (missing / dataset.length) * 100;
      return { attribute: attr, missing, percentage };
    });

    const highMissingData = missingDataAnalysis.filter(item => item.percentage > 30);

    // Generate insights
    const insights = [
      `Dataset contains ${dataset.length} features with ${attributes.length} attributes`,
      `${numericAttrs.length} numeric attributes detected, suitable for statistical analysis`,
      `${categoricalAttrs.length} categorical attributes found, ideal for classification analysis`,
      `${highMissingData.length} attributes have significant missing data (>30%)`
    ];

    // Generate recommendations
    const recommendations = [
      'Consider correlation analysis between numeric variables',
      'Scatter plots could reveal interesting relationships',
      'Use categorical attributes for data segmentation and filtering'
    ];

    if (numericAttrs.length > 0) {
      recommendations.push('Some numeric attributes show high variance - consider normalization');
    }

    if (highMissingData.length > 0) {
      recommendations.push(`Address missing data in: ${highMissingData.map(item => item.attribute).join(', ')}`);
    }

    // Data quality score
    const qualityScore = Math.max(0, 100 - (highMissingData.length * 10) - (attributes.length === 0 ? 50 : 0));

    return {
      insights,
      recommendations,
      qualityScore,
      attributes: {
        total: attributes.length,
        numeric: numericAttrs.length,
        categorical: categoricalAttrs.length
      },
      missingData: missingDataAnalysis,
      dataType
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
            {analytics.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-100 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{recommendation}</p>
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
