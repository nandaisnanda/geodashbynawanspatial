import React from 'react';

const WelcomeSection = () => {
  return (
    <section className="text-center space-y-6 animate-fade-in-up animate-delay-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Advanced Geospatial Analytics Platform
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Upload your geospatial data for instant smart analysis, beautiful visualizations, 
          and professional reporting with AI-powered insights and recommendations.
        </p>
      </div>
    </section>
  );
};

export default WelcomeSection;