// Design Agent Service
// Handles image generation using Google AI (Gemini) for Recipe Labs branded content

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// Use the same API key access pattern as ToolPage (defined in vite.config.ts)
// @ts-ignore - process.env is defined by vite.config.ts
const getAPIKey = () => process.env.API_KEY || process.env.GEMINI_API_KEY || '';

export interface DesignPrompt {
  type: 'flyer' | 'instagram';
  title?: string;
  description?: string;
  callToAction?: string;
  colorScheme?: 'lemon' | 'forest' | 'gradient';
  style?: 'modern' | 'minimal' | 'bold' | 'elegant';
  additionalInstructions?: string;
}

export interface GeneratedImage {
  url?: string;
  base64?: string;
  prompt: string;
  timestamp: string;
}

class DesignAgentService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Initialize will happen on first use with current API key
  }

  private buildPrompt(prompt: DesignPrompt): string {
    const brandGuidelines = `
Recipe Labs Brand Guidelines:
- Primary Colors: Fresh Lemonade Palette
  * Lemon Yellow: #F5D547
  * Lemon Light: #F7E07A
  * Lemon Dark: #D4B83A
  * Forest Green: #4A7C4E
  * Mint: #9AA590
  * Sage: #6B8E6B
- Typography: Orbitron (display), Montserrat (body), Rajdhani (tech)
- Style: Modern, tech-forward, creative, professional
- Tone: Innovative, fresh, energetic, trustworthy
`;

    let promptText = brandGuidelines + '\n\n';

    if (prompt.type === 'flyer') {
      promptText += `Create a professional flyer design with the following specifications:
- Type: Marketing Flyer
- Title: ${prompt.title || 'Recipe Labs'}
- Description: ${prompt.description || 'AI-Powered Creative Solutions'}
- Call to Action: ${prompt.callToAction || 'Get Started'}
- Color Scheme: ${prompt.colorScheme || 'gradient'} (using Recipe Labs brand colors)
- Style: ${prompt.style || 'modern'}
- Include: Logo space, compelling headline, key benefits, contact information area
- Dimensions: 8.5" x 11" (flyer format)
- Brand: Recipe Labs - AI Creative Suite
${prompt.additionalInstructions ? `- Additional Instructions: ${prompt.additionalInstructions}` : ''}

Design Requirements:
- Use Recipe Labs brand colors prominently
- Modern, clean layout
- Professional typography
- Eye-catching visuals
- Clear hierarchy
- Brand-consistent styling`;
    } else if (prompt.type === 'instagram') {
      promptText += `Create an Instagram post design with the following specifications:
- Type: Instagram Post (Square format, 1080x1080px)
- Title/Caption: ${prompt.title || 'Recipe Labs'}
- Description: ${prompt.description || 'AI-Powered Creative Solutions'}
- Call to Action: ${prompt.callToAction || 'Learn More'}
- Color Scheme: ${prompt.colorScheme || 'gradient'} (using Recipe Labs brand colors)
- Style: ${prompt.style || 'modern'}
- Include: Engaging visual, brand colors, readable text overlay, Instagram-optimized
- Dimensions: 1080x1080px (square)
- Brand: Recipe Labs - AI Creative Suite
${prompt.additionalInstructions ? `- Additional Instructions: ${prompt.additionalInstructions}` : ''}

Design Requirements:
- Instagram-optimized square format
- Bold, eye-catching design
- Recipe Labs brand colors
- Social media friendly
- Text should be readable on mobile
- Modern, engaging aesthetic`;
    }

    return promptText;
  }

  async generateImage(prompt: DesignPrompt): Promise<GeneratedImage> {
    // Get API key (same as ToolPage)
    // @ts-ignore - process.env is defined by vite.config.ts
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('API Key check:', {
        'process.env.API_KEY': process.env.API_KEY,
        'process.env.GEMINI_API_KEY': process.env.GEMINI_API_KEY,
        'typeof process': typeof process,
        'process exists': typeof process !== 'undefined'
      });
      throw new Error('Google AI API key not configured. Please check environment variables. The API key should be set in .env.local as GEMINI_API_KEY.');
    }
    
    // Initialize AI if not already done
    if (!this.ai) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (error) {
        console.error('Failed to initialize Google AI:', error);
        throw new Error(`Failed to initialize Google AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    try {
      const fullPrompt = this.buildPrompt(prompt);
      
      // First, use Gemini to create an optimized, detailed image generation prompt
      if (this.ai) {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `You are a professional graphic designer specializing in marketing materials. Create a highly detailed, specific prompt for an AI image generator to create this design. Be extremely specific about:

${fullPrompt}

Provide a detailed, specific prompt that an AI image generator could use. Include:
- Exact colors (hex codes: #F5D547, #D4B83A, #4A7C4E)
- Layout composition
- Typography style
- Visual elements
- Brand consistency
- Professional design principles

Output only the optimized prompt, nothing else.`,
        });

        const optimizedPrompt = response.text;
        
        // Generate actual image using Gemini Image Generation (like mh5-flyer-engine)
        try {
          const aspectRatio = prompt.type === 'instagram' ? '1:1' : '3:4';
          
          const imageResponse: GenerateContentResponse = await this.ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
              parts: [
                { text: `Create a ${prompt.type === 'instagram' ? 'square Instagram post' : 'marketing flyer'} design with the following specifications:

${optimizedPrompt}

Recipe Labs Brand Guidelines:
- Primary Colors: Lemon Yellow (#F5D547), Forest Green (#4A7C4E), Lemon Light (#F7E07A)
- Typography: Orbitron (display), Montserrat (body)
- Style: Modern, tech-forward, creative, professional
- Brand Text: "Recipe Labs" or "RL"
- URL: "RecipeLabs.ai" at bottom

Design Requirements:
- Use Recipe Labs brand colors prominently
- Modern, clean layout
- Professional typography
- Eye-catching visuals
- Clear hierarchy
- Brand-consistent styling

Output: Return ONLY the final synthesized ${prompt.type === 'instagram' ? 'Instagram post' : 'flyer'} image as a high-quality PNG.` }
              ]
            },
            config: { imageConfig: { aspectRatio } }
          });

          const candidate = imageResponse.candidates?.[0];
          if (!candidate || candidate.finishReason === 'SAFETY') {
            throw new Error("BRAND_PROTECTION_TRIPPED");
          }

          for (const part of candidate.content?.parts || []) {
            if (part.inlineData) {
              const imageDataUrl = `data:image/png;base64,${part.inlineData.data}`;
              return {
                base64: part.inlineData.data,
                url: imageDataUrl,
                prompt: optimizedPrompt,
                timestamp: new Date().toISOString(),
              };
            }
          }
          
          throw new Error("RENDER_NULL_RETURN");
        } catch (imageError: any) {
          console.warn('Image generation failed:', imageError);
          // Fallback: return the optimized prompt
          return {
            prompt: optimizedPrompt,
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        // Fallback if AI not initialized
        return {
          prompt: fullPrompt,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImageWithImagen(prompt: DesignPrompt & { optimizedPrompt?: string }): Promise<GeneratedImage> {
    const imagePrompt = prompt.optimizedPrompt || this.buildPrompt(prompt);
    
    // Get API key (same as ToolPage)
    // @ts-ignore - process.env is defined by vite.config.ts
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google AI API key not configured.');
    }
    
    try {
      // Call Google's Imagen API for image generation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            number_of_images: 1,
            aspect_ratio: prompt.type === 'instagram' ? '1:1' : '8.5:11',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Imagen API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      // Extract image data from response
      if (data.generatedImages && data.generatedImages.length > 0) {
        const image = data.generatedImages[0];
        return {
          url: image.imageUrl || image.base64Uri,
          base64: image.base64Uri,
          prompt: imagePrompt,
          timestamp: new Date().toISOString(),
        };
      }

      throw new Error('No images generated in response');
    } catch (error) {
      // If Imagen API fails, return the prompt for manual generation
      console.warn('Imagen API call failed:', error);
      return {
        prompt: imagePrompt,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getBrandColors(): Record<string, string> {
    return {
      lemon: '#F5D547',
      lemonLight: '#F7E07A',
      lemonDark: '#D4B83A',
      forest: '#4A7C4E',
      mint: '#9AA590',
      sage: '#6B8E6B',
      bg: '#0f1410',
      bgSecondary: '#141a16',
    };
  }

  getBrandGradients(): string[] {
    return [
      'linear-gradient(135deg, #F5D547 0%, #D4B83A 50%, #4A7C4E 100%)',
      'linear-gradient(135deg, #4A7C4E 0%, #D4B83A 50%, #F5D547 100%)',
      'linear-gradient(90deg, #F5D547, #D4B83A, #4A7C4E, #6B8E6B)',
    ];
  }
}

export const designAgentService = new DesignAgentService();

