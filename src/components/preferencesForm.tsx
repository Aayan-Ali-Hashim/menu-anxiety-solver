import React from 'react';
import type { Preferences } from '../types/index';

interface PreferencesFormProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  preferences, 
  onPreferencesChange 
}) => {
  const handleChange = (field: keyof Preferences, value: string): void => {
    onPreferencesChange({
      ...preferences,
      [field]: value
    });
  };

  return (
    <div className="preferences-section">
      <h2>Tell us your preferences</h2>
      
      <div className="input-group">
        <label htmlFor="dietary">Dietary Restrictions</label>
        <input 
          id="dietary"
          type="text"
          placeholder="e.g., vegetarian, gluten-free, no shellfish"
          value={preferences.dietary}
          onChange={(e) => handleChange('dietary', e.target.value)}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="budget">Budget ($)</label>
        <input 
          id="budget"
          type="number"
          placeholder="e.g., 25"
          value={preferences.budget}
          onChange={(e) => handleChange('budget', e.target.value)}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="mood">What are you craving?</label>
        <input 
          id="mood"
          type="text"
          placeholder="e.g., something comforting, light and fresh, spicy"
          value={preferences.mood}
          onChange={(e) => handleChange('mood', e.target.value)}
        />
      </div>
    </div>
  );
};

export default PreferencesForm;