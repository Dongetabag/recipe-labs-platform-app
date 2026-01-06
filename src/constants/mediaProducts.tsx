// Recipe Labs Media Products
// Different media formats for Recipe Labs branded content

import { MediaProductType } from '../types/mediaTypes';

export const MEDIA_PRODUCTS: MediaProductType[] = [
  {
    id: 'flyer',
    name: 'Marketing Flyer',
    icon: '📄',
    aspectRatio: '3:4',
    description: 'Professional marketing flyer.',
    basePrompt: 'SYNTHESIZE a professional Recipe Labs flyer that FRAMES the source subject. "Recipe Labs" in modern typography should complement the subject. Clean, modern design with brand colors.'
  },
  {
    id: 'story',
    name: 'IG Story',
    icon: '📱',
    aspectRatio: '9:16',
    description: 'Instagram Story format.',
    basePrompt: 'TRANSFORM into a high-impact Recipe Labs STORY. Composition: Vertical 9:16. FRAME the subject. Highlight the subject clearly. "Recipe Labs" branding should be header-style or sidebar-style. NO DATE. Include "RecipeLabs.ai" at the footer.'
  },
  {
    id: 'reel',
    name: 'Reel Cover',
    icon: '🎬',
    aspectRatio: '9:16',
    description: 'Reel or TikTok frame.',
    basePrompt: 'DESIGN a Recipe Labs REEL COVER. Highlight the subject center-stage. "Recipe Labs" as a bold backdrop or header. Ensure clear visibility of the source image. NO DATE. Integrate "RecipeLabs.ai" cleanly.'
  },
  {
    id: 'post',
    name: 'Feed Post',
    icon: '🖼️',
    aspectRatio: '1:1',
    description: 'Standard 1:1 post.',
    basePrompt: 'SYNTHESIZE a square Recipe Labs post. Highlight the source subject. Balanced composition where "Recipe Labs" branding complements the subject.'
  },
  {
    id: 'banner',
    name: 'Web Banner',
    icon: '🖥️',
    aspectRatio: '16:9',
    description: 'Website banner format.',
    basePrompt: 'CREATE a Recipe Labs web banner. Wide format 16:9. Subject should be prominent. "Recipe Labs" branding integrated cleanly. Modern, professional design.'
  },
  {
    id: 'promo',
    name: 'Promo Card',
    icon: '🎯',
    aspectRatio: '3:4',
    description: 'Promotional card.',
    basePrompt: 'TRANSFORM into a Recipe Labs promo card. Highlight the source subject. "Recipe Labs" branding as a secondary bold element. Modern, energetic design.'
  }
];


