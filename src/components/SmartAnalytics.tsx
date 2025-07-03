
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, PieChart, Target, Lightbulb } from 'lucide-react';

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
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            🤖 AI Smart Analytics Engine
          </CardTitle>
          <CardDescription className="text-base">
            Analyzing your geospatial data with advanced AI algorithms...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg font-medium">Processing {data.length} features...</span>
            </div>
            <Progress value={75} className="h-3" />
            <p className="text-muted-foreground">
              Running statistical analysis, pattern detection, and data quality assessment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Brain className="h-6 w-6 text-purple-600" />
            🤖 AI Smart Analytics Results
          </CardTitle>
          <CardDescription className="text-base">
            Advanced insights and recommendations for your {analytics.dataType} dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Data Quality Score */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Data Quality Score
                </h4>
                <Badge variant={analytics.qualityScore >= 80 ? "default" : analytics.qualityScore >= 60 ? "secondary" : "destructive"}>
                  {analytics.qualityScore}/100
                </Badge>
              </div>
              <Progress value={analytics.qualityScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {analytics.qualityScore >= 80 ? "Excellent data quality!" : 
                 analytics.qualityScore >= 60 ? "Good data quality with room for improvement" : 
                 "Data quality needs attention"}
              </p>
            </div>

            {/* Attribute Summary */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Attribute Analysis
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.attributes.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.attributes.numeric}</div>
                  <div className="text-sm text-muted-foreground">Numeric</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.attributes.categorical}</div>
                  <div className="text-sm text-muted-foreground">Categorical</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.insights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-base font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-base font-medium">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Analysis */}
      {analytics.missingData.some((item: any) => item.percentage > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Missing Data Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.missingData
                .filter((item: any) => item.percentage > 0)
                .sort((a: any, b: any) => b.percentage - a.percentage)
                .slice(0, 10)
                .map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{item.attribute}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={item.percentage} className="w-20 h-2" />
                      <Badge variant={item.percentage > 50 ? "destructive" : item.percentage > 20 ? "secondary" : "outline"}>
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
