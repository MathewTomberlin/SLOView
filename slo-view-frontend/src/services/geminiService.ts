import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse } from '../types/chat';
import { MapContext, formatMapContextForPrompt } from '../utils/contextFormatter';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!apiKey) {
      throw new Error('REACT_APP_GEMINI_API_KEY is not defined');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async sendMessage(message: string, mapContext?: MapContext | null): Promise<GeminiResponse> {
    try {
      // Create the enhanced prompt with map context
      let enhancedPrompt = message;
      
      if (mapContext && mapContext.selectedLayer !== 'none') {
        const contextString = formatMapContextForPrompt(mapContext);
        enhancedPrompt = `You are a helpful assistant for a map application showing San Luis Obispo County, California. The user is asking about the map data they have loaded.${contextString}\n\nUser Question: ${message}\n\nPlease provide a helpful response based on the map data context provided above.`;
      } else {
        enhancedPrompt = `You are a helpful assistant for a map application showing San Luis Obispo County, California. The user is asking about the map. Please provide a helpful response.\n\nUser Question: ${message}`;
      }

      console.log('Enhanced prompt:', enhancedPrompt);
      
      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        text,
        success: true
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;
