import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse } from '../types/chat';
import { MapContext, formatMapContextForPrompt } from '../utils/contextFormatter';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('REACT_APP_GEMINI_API_KEY is not defined');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.initialized = true;
  }

  async sendMessage(message: string, mapContext?: MapContext | null): Promise<GeminiResponse> {
    try {
      // Initialize the service only when needed
      this.initialize();
      
      // Create the enhanced prompt with map context
      let enhancedPrompt = message;
      
      if (mapContext && mapContext.selectedLayer !== 'none') {
        const contextString = formatMapContextForPrompt(mapContext);
        enhancedPrompt = `You are a helpful assistant for a map application showing San Luis Obispo County, California. The user is asking about the map data they have loaded.${contextString}\n\nUser Question: ${message}\n\nPlease provide a helpful response based on the map data context provided above.`;
      } else {
        enhancedPrompt = `You are a helpful assistant for a map application showing San Luis Obispo County, California. The user is asking about the map. Please provide a helpful response.\n\nUser Question: ${message}`;
      }
      
      const result = await this.model!.generateContent(enhancedPrompt);
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
