import { GoogleGenerativeAI, GenerativeModel, type GenerateContentResult } from "@google/generative-ai";
import type { Preferences, AnalysisResult } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('⚠️ API Key is missing! Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 4000; // 4 seconds between requests

interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

async function fileToGenerativePart(file: File): Promise<GenerativePart> {
  return new Promise<GenerativePart>((resolve, reject) => {
    const reader: FileReader = new FileReader();
    
    reader.onloadend = (): void => {
      try {
        const result = reader.result as string;
        const base64Data: string = result.split(',')[1];
        
        console.log('✅ Image converted to base64, size:', base64Data.length);
        
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      } catch (error) {
        reject(new Error('Failed to process image data'));
      }
    };
    
    reader.onerror = (): void => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

export async function analyzeMenu(
  imageFile: File, 
  preferences: Preferences
): Promise<AnalysisResult> {
  try {
    // ✅ Rate limiting logic
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${Math.round(waitTime/1000)}s before request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();

    console.log('🔍 Starting menu analysis...');
    console.log('Image:', imageFile.name, imageFile.type, imageFile.size);
    console.log('Preferences:', preferences);

    const model: GenerativeModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash"  // Using stable model with better rate limits
    });

    console.log('📸 Converting image...');
    const imageData: GenerativePart = await fileToGenerativePart(imageFile);

    const prompt: string = `You are a helpful restaurant menu analyzer. 
  
Analyze this menu image and recommend dishes based on these preferences:
- Dietary restrictions: ${preferences.dietary || 'none'}
- Budget: $${preferences.budget || 'no limit'}
- Craving/mood: ${preferences.mood || 'anything good'}

Provide 2-3 recommendations with:
1. Dish name and price
2. Why it fits their preferences
3. Any warnings (allergens, spice level, etc.)
4. Value assessment (1-10)

Respond ONLY with valid JSON in this exact structure (no markdown, no code blocks):
{
  "recommendations": [
    {
      "dish": "dish name",
      "price": "12.99",
      "reasoning": "explanation",
      "warnings": "any concerns or leave empty",
      "valueScore": 8
    }
  ]
}`;

    console.log('🤖 Sending request to Gemini...');
    const result: GenerateContentResult = await model.generateContent([prompt, imageData]);
    
    console.log('✅ Response received from Gemini');
    const responseText: string = result.response.text();
    console.log('Raw response:', responseText);
    
    // Clean up response in case Gemini adds markdown code blocks
    const cleanedText: string = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    console.log('Cleaned response:', cleanedText);

    const parsedResult: AnalysisResult = JSON.parse(cleanedText);
    console.log('✅ Successfully parsed result:', parsedResult);
    
    return parsedResult;
  } catch (error: any) {
    console.error('❌ Error in analyzeMenu:', error);
    
    // More specific error messages
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your .env file.');
    }
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('Rate limit reached. Please wait 60 seconds and try again.');
    }
    if (error.message?.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
    
    throw new Error(`Analysis failed: ${error.message || 'Unknown error'}`);
  }
}

export async function listAvailableModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await response.json();
    console.log('📋 Available models:', data.models?.map((m: any) => m.name));
    return data.models;
  } catch (error) {
    console.error('Error listing models:', error);
  }
}