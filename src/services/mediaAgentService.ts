// Recipe Labs Media Agent Service
// Generates branded media assets using Canvas API + Google Gemini for AI assistance

import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { MediaProductType, MediaDesignSpec, MediaChatMessage } from '../types/mediaTypes';
import { imageGeneratorService } from './imageGeneratorService';

// @ts-ignore - process.env is defined by vite.config.ts
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

/**
 * Clean response text from potential markdown block wrappers or truncation.
 */
function cleanJsonResponse(text: string): string {
  if (!text) return '{}';
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  
  if (cleaned.endsWith('}') === false && cleaned.endsWith(']') === false) {
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const lastValidIndex = Math.max(lastBrace, lastBracket);
    if (lastValidIndex !== -1) {
      cleaned = cleaned.substring(0, lastValidIndex + 1);
    }
  }
  
  return cleaned.trim();
}

export async function generateCategorySuggestions(
  product: MediaProductType,
  currentSpec: MediaDesignSpec
): Promise<{ title: string; spec: Partial<MediaDesignSpec> }[]> {
  if (!API_KEY) throw new Error('Google AI API key not configured');
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-2.0-flash-exp';
  
  const systemInstruction = `
    ACT AS THE RECIPE LABS CREATIVE DIRECTOR. 
    GENERATE 3 CONCISE DESIGN "PROTOCOLS" FOR: "${product.name}".
    FORMAT: ${product.aspectRatio}

    BRAND IDENTITY: Modern, tech-forward, creative, professional. Fresh Lemonade Palette (Lemon Yellow #F5D547, Forest Green #4A7C4E).
    PRIMARY TEXT RULE: ALWAYS USE "Recipe Labs" or "RL" branding.
    
    RETURN VALID JSON ONLY. KEEP DESCRIPTIONS CONCISE.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  spec: {
                    type: Type.OBJECT,
                    properties: {
                      eventTitle: { type: Type.STRING },
                      colorPalette: { type: Type.STRING },
                      vibe: { type: Type.STRING },
                      fontFamily: { type: Type.STRING },
                      fontWeight: { type: Type.STRING },
                      letterSpacing: { type: Type.STRING }
                    },
                    required: ['eventTitle', 'colorPalette', 'vibe']
                  }
                },
                required: ['title', 'spec']
              }
            }
          },
          required: ['suggestions']
        }
      }
    });

    const cleanedText = cleanJsonResponse(response.text || '{"suggestions": []}');
    const data = JSON.parse(cleanedText);
    return data.suggestions || [];
  } catch (e) {
    console.error("RL_SUGGESTION_FAULT:", e);
    return [
      { title: "MODERN_TECH", spec: { eventTitle: "Recipe Labs", colorPalette: "Lemon & Forest Gradient", vibe: "Modern Tech" } },
      { title: "CREATIVE_BOLD", spec: { eventTitle: "Recipe Labs AI", colorPalette: "Vibrant Lemon", vibe: "Creative Bold" } }
    ];
  }
}

export async function processDesignChat(
  userInput: string,
  history: MediaChatMessage[],
  currentSpec: MediaDesignSpec
): Promise<{ updatedSpec: MediaDesignSpec; assistantResponse: string }> {
  if (!API_KEY) throw new Error('Google AI API key not configured');
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-2.0-flash-exp';
  
  const systemInstruction = `
    ACT AS THE RECIPE LABS CREATIVE DIRECTOR. 
    MANAGE THE MASTER DESIGN SPEC.
    CURRENT SPEC: ${JSON.stringify(currentSpec)}
    
    RESPOND AS A HIGH-LEVEL CREATIVE DIRECTOR. CONCISE. PROFESSIONAL.
    STRICT RULE: PRIMARY BRAND TEXT IS "Recipe Labs" or "RL".
    RETURN VALID JSON ONLY.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...history.slice(-6).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedSpec: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                date: { type: Type.STRING },
                includeDate: { type: Type.BOOLEAN },
                eventTitle: { type: Type.STRING },
                colorPalette: { type: Type.STRING },
                vibe: { type: Type.STRING },
                fontFamily: { type: Type.STRING },
                fontWeight: { type: Type.STRING },
                letterSpacing: { type: Type.STRING },
                additionalNotes: { type: Type.STRING }
              }
            },
            assistantResponse: { type: Type.STRING }
          },
          required: ['updatedSpec', 'assistantResponse']
        }
      }
    });

    const cleanedText = cleanJsonResponse(response.text || '{}');
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("RL_CHAT_FAULT:", e);
    return { updatedSpec: currentSpec, assistantResponse: "DIRECTOR: Interference detected. Confirming Recipe Labs brand protocols." };
  }
}

export async function editGeneratedImage(
  renderedBase64: string,
  editInstructions: string,
  product: MediaProductType,
  designSpec: MediaDesignSpec,
  originalSourceImage?: string
): Promise<string> {
  // Use AI to understand the edit request and analyze the current image
  let updatedSpec = { ...designSpec };
  let editParams: any = {};
  
  if (API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const base64Data = renderedBase64.includes(',') ? renderedBase64.split(',')[1] : renderedBase64;
      
      const editPrompt = `
        You are a Recipe Labs Creative Director analyzing a branded media asset for refinement.
        
        CURRENT IMAGE: This is a Recipe Labs branded ${product.name} with the following design specifications:
        ${JSON.stringify(designSpec, null, 2)}
        
        USER EDIT REQUEST: "${editInstructions}"
        
        Analyze the image and the edit request. Provide detailed instructions for how to modify the design.
        
        Return JSON with:
        {
          "eventTitle": "updated title text or null to keep current",
          "colorPalette": "updated color description (e.g. 'Lemon Yellow Dominant', 'Forest Green Gradient', 'Darker tones')",
          "vibe": "updated style description",
          "fontFamily": "updated font name or null to keep current",
          "fontWeight": "Light/Regular/Bold/Black or null",
          "letterSpacing": "Tight/Normal/Wide/Ultra-Wide or null",
          "includeDate": true/false or null,
          "textPosition": "top/center/bottom or null",
          "textSize": "smaller/larger/same or null",
          "overlayOpacity": "lighter/darker/same or null",
          "additionalNotes": "specific visual changes to apply"
        }
        
        Interpret the user's request intelligently:
        - "darker" = darker colors, higher overlay opacity
        - "brighter/lighter" = lighter colors, lower overlay opacity
        - "move logo/text to [position]" = adjust textPosition
        - "bigger/smaller text" = adjust textSize
        - "change font" = suggest new fontFamily
        - "remove date" = includeDate: false
        - "add date" = includeDate: true
        - "more vibrant" = brighter colorPalette
        - "more subtle" = darker, lower opacity
        
        Return only valid JSON.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: editPrompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              eventTitle: { type: Type.STRING },
              colorPalette: { type: Type.STRING },
              vibe: { type: Type.STRING },
              fontFamily: { type: Type.STRING },
              fontWeight: { type: Type.STRING },
              letterSpacing: { type: Type.STRING },
              includeDate: { type: Type.BOOLEAN },
              textPosition: { type: Type.STRING },
              textSize: { type: Type.STRING },
              overlayOpacity: { type: Type.STRING },
              additionalNotes: { type: Type.STRING }
            }
          }
        }
      });
      
      const cleanedText = cleanJsonResponse(response.text || '{}');
      const editData = JSON.parse(cleanedText);
      
      // Update spec with AI suggestions
      updatedSpec = {
        ...designSpec,
        eventTitle: editData.eventTitle || designSpec.eventTitle,
        colorPalette: editData.colorPalette || designSpec.colorPalette,
        vibe: editData.vibe || designSpec.vibe,
        fontFamily: editData.fontFamily || designSpec.fontFamily,
        fontWeight: editData.fontWeight || designSpec.fontWeight,
        letterSpacing: editData.letterSpacing || designSpec.letterSpacing,
        includeDate: editData.includeDate !== undefined ? editData.includeDate : designSpec.includeDate,
        additionalNotes: editData.additionalNotes || designSpec.additionalNotes
      };
      
      // Store edit parameters for canvas generation
      editParams = {
        textPosition: editData.textPosition,
        textSize: editData.textSize,
        overlayOpacity: editData.overlayOpacity
      };
    } catch (error) {
      console.warn('AI edit analysis failed, using keyword parsing:', error);
      // Enhanced keyword-based updates
      const lowerInstructions = editInstructions.toLowerCase();
      
      if (lowerInstructions.includes('darker')) {
        updatedSpec.colorPalette = 'Forest Green Dominant';
        editParams.overlayOpacity = 'darker';
      } else if (lowerInstructions.includes('brighter') || lowerInstructions.includes('lighter')) {
        updatedSpec.colorPalette = 'Lemon Yellow Dominant';
        editParams.overlayOpacity = 'lighter';
      }
      
      if (lowerInstructions.includes('center') || lowerInstructions.includes('centre')) {
        editParams.textPosition = 'center';
      } else if (lowerInstructions.includes('top')) {
        editParams.textPosition = 'top';
      } else if (lowerInstructions.includes('bottom')) {
        editParams.textPosition = 'bottom';
      }
      
      if (lowerInstructions.includes('bigger') || lowerInstructions.includes('larger')) {
        editParams.textSize = 'larger';
      } else if (lowerInstructions.includes('smaller')) {
        editParams.textSize = 'smaller';
      }
      
      if (lowerInstructions.includes('remove date') || lowerInstructions.includes('no date')) {
        updatedSpec.includeDate = false;
      } else if (lowerInstructions.includes('add date') || lowerInstructions.includes('include date')) {
        updatedSpec.includeDate = true;
      }
    }
  }
  
  // Use original source image if available, otherwise use rendered image
  const sourceImage = originalSourceImage || renderedBase64;
  
  // Regenerate with updated spec and edit parameters
  return generateImageWithCanvas(sourceImage, product, updatedSpec, editInstructions, null, editParams);
}

export async function generateProductImage(
  base64Image: string,
  product: MediaProductType,
  designSpec: MediaDesignSpec,
  individualOverride?: string,
  mimeType: string = 'image/png',
  referenceFlyerUrl?: string | null
): Promise<string> {
  // Use AI to analyze the image and generate design instructions
  let aiDesignInstructions = '';
  
  if (API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      
      const analysisPrompt = `
        Analyze this image and provide design instructions for creating a Recipe Labs branded ${product.name}.
        
        Design Requirements:
        - Primary text: "Recipe Labs" or "RL"
        - Brand colors: Lemon Yellow (#F5D547), Forest Green (#4A7C4E)
        - Font: ${designSpec.fontFamily || 'Orbitron'}
        - ${designSpec.includeDate ? `Include date: ${designSpec.date || 'TBD'}` : 'No date'}
        - Style: ${designSpec.vibe || 'Modern Tech Creative'}
        - Aspect Ratio: ${product.aspectRatio}
        
        Provide a concise description of how to overlay Recipe Labs branding on this image without obscuring the main subject.
        Focus on: text placement, color usage, and layout composition.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: analysisPrompt }
          ]
        }
      });
      
      aiDesignInstructions = response.text || '';
    } catch (error) {
      console.warn('AI analysis failed, using default design:', error);
    }
  }
  
  // Generate the actual image using canvas
  return generateImageWithCanvas(base64Image, product, designSpec, aiDesignInstructions, referenceFlyerUrl);
}

// Recipe Labs Brand Constants
const RECIPE_LABS_BRAND = {
  colors: {
    lemon: '#F5D547',
    lemonLight: '#F7E07A',
    lemonDark: '#D4B83A',
    forest: '#4A7C4E',
    mint: '#9AA590',
    sage: '#6B8E6B',
    bgDark: '#0f1410',
    bgSecondary: '#141a16',
    textMuted: '#a8b4a4',
  },
  fonts: {
    display: 'Orbitron',
    body: 'Montserrat',
    tech: 'Rajdhani'
  }
};

// Draw Recipe Labs Logo on Canvas
function drawRecipeLabsLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const scale = size / 100;
  ctx.save();
  ctx.translate(x - size/2, y - size/2);
  ctx.scale(scale, scale);

  // Create gradient for logo background
  const gradient = ctx.createLinearGradient(0, 0, 100, 100);
  gradient.addColorStop(0, RECIPE_LABS_BRAND.colors.lemon);
  gradient.addColorStop(0.5, RECIPE_LABS_BRAND.colors.lemonDark);
  gradient.addColorStop(1, RECIPE_LABS_BRAND.colors.forest);

  // Draw rounded rectangle background
  ctx.beginPath();
  ctx.roundRect(0, 0, 100, 100, 16);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw "R" letter
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(30, 25);
  ctx.lineTo(55, 25);
  ctx.bezierCurveTo(66, 25, 75, 34, 75, 45);
  ctx.bezierCurveTo(75, 56, 66, 65, 55, 65);
  ctx.lineTo(50, 65);
  ctx.lineTo(70, 75);
  ctx.lineTo(50, 75);
  ctx.lineTo(30, 65);
  ctx.closePath();
  ctx.fill();

  // Inner cutout for R
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(40, 35);
  ctx.lineTo(40, 55);
  ctx.lineTo(55, 55);
  ctx.bezierCurveTo(60.5, 55, 65, 50.5, 65, 45);
  ctx.bezierCurveTo(65, 39.5, 60.5, 35, 55, 35);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw Brand Spectrum Bar
function drawSpectrumBar(ctx: CanvasRenderingContext2D, y: number, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, y, width, y);
  gradient.addColorStop(0, RECIPE_LABS_BRAND.colors.lemon);
  gradient.addColorStop(0.25, RECIPE_LABS_BRAND.colors.lemonDark);
  gradient.addColorStop(0.5, RECIPE_LABS_BRAND.colors.forest);
  gradient.addColorStop(0.75, RECIPE_LABS_BRAND.colors.sage);
  gradient.addColorStop(1, RECIPE_LABS_BRAND.colors.bgDark);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, y, width, height);
}

// Draw subtle tech grid overlay
function drawTechGrid(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number = 0.03) {
  ctx.strokeStyle = `rgba(245, 213, 71, ${opacity})`;
  ctx.lineWidth = 1;

  const gridSize = 50;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function generateImageWithCanvas(
  sourceImageBase64: string,
  product: MediaProductType,
  designSpec: MediaDesignSpec,
  aiInstructions: string = '',
  referenceFlyerUrl?: string | null,
  editParams?: {
    textPosition?: string;
    textSize?: string;
    overlayOpacity?: string;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Calculate dimensions based on aspect ratio
      let width: number, height: number;
      const aspectRatio = product.aspectRatio;

      if (aspectRatio === '9:16') {
        width = 1080;
        height = 1920;
      } else if (aspectRatio === '1:1') {
        width = 1080;
        height = 1080;
      } else if (aspectRatio === '16:9') {
        width = 1920;
        height = 1080;
      } else if (aspectRatio === '3:4') {
        width = 1080;
        height = 1440;
      } else {
        width = 1080;
        height = 1080;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Load source image
      const sourceImg = new Image();
      sourceImg.onload = () => {
        // Draw source image as background (cover)
        const sourceAspect = sourceImg.width / sourceImg.height;
        const canvasAspect = width / height;

        let drawWidth = width;
        let drawHeight = height;
        let drawX = 0;
        let drawY = 0;

        if (sourceAspect > canvasAspect) {
          drawHeight = width / sourceAspect;
          drawY = (height - drawHeight) / 2;
        } else {
          drawWidth = height * sourceAspect;
          drawX = (width - drawWidth) / 2;
        }

        // Fill background with brand dark color first
        ctx.fillStyle = RECIPE_LABS_BRAND.colors.bgDark;
        ctx.fillRect(0, 0, width, height);

        // Draw the source image
        ctx.drawImage(sourceImg, drawX, drawY, drawWidth, drawHeight);

        // Add subtle tech grid overlay
        drawTechGrid(ctx, width, height, 0.02);

        // Add overlay gradient for text readability (adjustable opacity)
        const overlayOpacity = editParams?.overlayOpacity === 'darker' ? 0.7 :
                               editParams?.overlayOpacity === 'lighter' ? 0.25 : 0.45;

        // Top gradient (for header area)
        const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4);
        topGradient.addColorStop(0, `rgba(15, 20, 16, ${overlayOpacity * 0.9})`);
        topGradient.addColorStop(1, 'rgba(15, 20, 16, 0)');
        ctx.fillStyle = topGradient;
        ctx.fillRect(0, 0, width, height * 0.4);

        // Bottom gradient (for footer area)
        const bottomGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
        bottomGradient.addColorStop(0, 'rgba(15, 20, 16, 0)');
        bottomGradient.addColorStop(1, `rgba(15, 20, 16, ${overlayOpacity * 1.1})`);
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);

        // Brand elements
        const padding = width * 0.055;
        const brand = RECIPE_LABS_BRAND.colors;

        // === TOP SECTION: Logo + Brand Badge ===
        const logoSize = width * 0.08;
        drawRecipeLabsLogo(ctx, padding + logoSize/2, padding + logoSize/2, logoSize);

        // Brand badge next to logo
        ctx.fillStyle = brand.lemon;
        ctx.font = `bold ${width * 0.022}px ${RECIPE_LABS_BRAND.fonts.display}, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('RECIPE LABS', padding + logoSize + 15, padding + logoSize * 0.35);

        ctx.fillStyle = brand.textMuted;
        ctx.font = `600 ${width * 0.014}px ${RECIPE_LABS_BRAND.fonts.tech}, sans-serif`;
        ctx.fillText('AI CREATIVE SUITE', padding + logoSize + 15, padding + logoSize * 0.65);

        // === CENTER SECTION: Main Content ===
        // Determine text position based on edit params
        let textY: number;
        if (editParams?.textPosition === 'top') {
          textY = height * 0.25;
        } else if (editParams?.textPosition === 'bottom') {
          textY = height * 0.65;
        } else {
          textY = height * 0.45; // Center (default)
        }

        // Determine text size based on edit params
        const baseFontSize = width * 0.085;
        const fontSize = editParams?.textSize === 'larger' ? baseFontSize * 1.25 :
                        editParams?.textSize === 'smaller' ? baseFontSize * 0.75 :
                        baseFontSize;

        // Main brand text with shadow for depth
        const brandText = designSpec.eventTitle || 'Recipe Labs';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `800 ${fontSize}px ${designSpec.fontFamily || RECIPE_LABS_BRAND.fonts.display}, sans-serif`;
        ctx.fillText(brandText, width / 2 + 4, textY + 4);

        // Main text with gradient effect (simulated)
        ctx.fillStyle = brand.lemon;
        ctx.fillText(brandText, width / 2, textY);

        // Tagline/Vibe text
        if (designSpec.vibe) {
          ctx.fillStyle = brand.lemonLight;
          ctx.font = `600 ${fontSize * 0.25}px ${RECIPE_LABS_BRAND.fonts.body}, sans-serif`;
          ctx.fillText(designSpec.vibe.toUpperCase(), width / 2, textY + fontSize * 0.7);
        }

        // Optional date badge
        if (designSpec.includeDate && designSpec.date) {
          const dateText = typeof designSpec.date === 'string' ? designSpec.date.toUpperCase() : String(designSpec.date).toUpperCase();
          const dateFontSize = fontSize * 0.2;
          ctx.font = `700 ${dateFontSize}px ${RECIPE_LABS_BRAND.fonts.tech}, sans-serif`;
          const dateWidth = ctx.measureText(dateText).width;

          // Date badge background
          const badgeX = width / 2 - dateWidth / 2 - 20;
          const badgeY = textY + fontSize * 1.1;
          ctx.fillStyle = `rgba(245, 213, 71, 0.15)`;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - dateFontSize * 0.6, dateWidth + 40, dateFontSize * 1.8, 25);
          ctx.fill();
          ctx.strokeStyle = brand.lemon;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Date text
          ctx.fillStyle = brand.lemon;
          ctx.fillText(dateText, width / 2, badgeY + dateFontSize * 0.3);
        }

        // === BOTTOM SECTION: URL + Spectrum Bar ===
        // URL badge
        const urlText = 'madebyrecipe.com';
        const urlFontSize = width * 0.028;
        ctx.font = `700 ${urlFontSize}px ${RECIPE_LABS_BRAND.fonts.body}, sans-serif`;
        const urlWidth = ctx.measureText(urlText).width;

        const urlBadgeY = height - padding - 30;
        ctx.fillStyle = `rgba(15, 20, 16, 0.8)`;
        ctx.beginPath();
        ctx.roundRect(width / 2 - urlWidth / 2 - 25, urlBadgeY - urlFontSize * 0.7, urlWidth + 50, urlFontSize * 1.8, 8);
        ctx.fill();

        ctx.fillStyle = brand.lemon;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(urlText, width / 2, urlBadgeY + urlFontSize * 0.2);

        // Brand spectrum bar at very bottom
        drawSpectrumBar(ctx, height - 4, width, 4);

        // Top spectrum bar (thin accent)
        drawSpectrumBar(ctx, 0, width, 3);

        // Convert to base64
        resolve(canvas.toDataURL('image/png'));
      };

      sourceImg.onerror = () => {
        reject(new Error('Failed to load source image'));
      };

      sourceImg.src = sourceImageBase64;
    } catch (error: any) {
      reject(new Error(error.message || 'STUDIO_OFFLINE'));
    }
  });
}


