import React from 'react';
import type { AnalysisResult } from '../types/index';

interface RecommendationsProps {
  results: AnalysisResult;
}

const Recommendations: React.FC<RecommendationsProps> = ({ results }) => {
  const renderStars = (score: number): string => {
    const starCount = Math.round(score / 2);
    return '⭐'.repeat(starCount);
  };

  return (
    <div className="recommendations">
      <h2>🎯 Your Perfect Picks</h2>
      
      {results.recommendations.map((rec, index) => (
        <div key={index} className="recommendation-card">
          <div className="card-header">
            <h3>{rec.dish}</h3>
            <span className="price">${rec.price}</span>
          </div>
          
          <p className="reasoning">{rec.reasoning}</p>
          
          {rec.warnings && rec.warnings.trim() !== '' && (
            <div className="warnings">
              <strong>⚠️ Note:</strong> {rec.warnings}
            </div>
          )}
          
          <div className="value-score">
            <span className="label">Value Score:</span>
            <span className="stars">{renderStars(rec.valueScore)}</span>
            <span className="score">{rec.valueScore}/10</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;