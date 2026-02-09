export interface Preferences {
  dietary: string;
  budget: string;
  mood: string;
}

export interface Recommendation {
  dish: string;
  price: string;
  reasoning: string;
  warnings?: string;
  valueScore: number;
}

export interface AnalysisResult {
  recommendations: Recommendation[];
}