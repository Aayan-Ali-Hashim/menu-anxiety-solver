import React, { useState, useEffect } from 'react';  // ✅ Add useEffect
import ImageUpload from './components/ImageUpload';
import PreferencesForm from './components/preferencesForm';
import Recommendations from './components/recommendations';
import { analyzeMenu, listAvailableModels } from './services/geminiService';  // ✅ Add listAvailableModels
import type{ Preferences, AnalysisResult } from './types';
import './App.css';

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    dietary: '',
    budget: '',
    mood: ''
  });
  const [recommendations, setRecommendations] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ADD THIS: Check available models when app loads
  useEffect(() => {
    listAvailableModels();
  }, []);

  const handleImageSelect = (file: File): void => {
    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear previous results
    setRecommendations(null);
    setError(null);
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!image) {
      setError('Please upload a menu image first!');
      return;
    }
    
    console.log('🚀 Starting analysis...');
    setLoading(true);
    setError(null);
    setRecommendations(null);
    
    try {
      const results = await analyzeMenu(image, preferences);
      setRecommendations(results);
      console.log('✅ Analysis complete!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze menu. Please try again.';
      setError(errorMessage);
      console.error('❌ Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🍽️ Menu Anxiety Solver</h1>
        <p className="tagline">Upload a menu and let AI pick the perfect dish for you!</p>
      </header>
      
      <div className="app-container">
        <ImageUpload 
          onImageSelect={handleImageSelect}
          imagePreview={imagePreview}
        />
        
        <PreferencesForm 
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />
        
        <button 
          onClick={handleAnalyze} 
          disabled={!image || loading}
          className="analyze-button"
        >
          {loading ? '🔍 Analyzing Menu...' : '✨ Get My Recommendations'}
        </button>

        {error && (
          <div className="error-message">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {recommendations && <Recommendations results={recommendations} />}
      </div>
    </div>
  );
}

export default App;
