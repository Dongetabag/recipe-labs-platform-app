// Image Generator Service
// Generates actual images using canvas API for Recipe Labs branded designs

export interface ImageGenerationOptions {
  type: 'flyer' | 'instagram';
  title: string;
  description: string;
  callToAction: string;
  colorScheme: 'lemon' | 'forest' | 'gradient';
  style: 'modern' | 'minimal' | 'bold' | 'elegant';
}

export class ImageGeneratorService {
  private brandColors = {
    lemon: '#F5D547',
    lemonLight: '#F7E07A',
    lemonDark: '#D4B83A',
    forest: '#4A7C4E',
    mint: '#9AA590',
    sage: '#6B8E6B',
    bg: '#0f1410',
    bgSecondary: '#141a16',
  };

  async generateImage(options: ImageGenerationOptions): Promise<string> {
    // Create canvas based on type
    const width = options.type === 'instagram' ? 1080 : 850;
    const height = options.type === 'instagram' ? 1080 : 1100;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw background
    this.drawBackground(ctx, width, height, options.colorScheme);

    // Draw content based on type
    if (options.type === 'flyer') {
      this.drawFlyerContent(ctx, width, height, options);
    } else {
      this.drawInstagramContent(ctx, width, height, options);
    }

    // Convert to base64
    return canvas.toDataURL('image/png');
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, colorScheme: string) {
    if (colorScheme === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, this.brandColors.lemon);
      gradient.addColorStop(0.5, this.brandColors.lemonDark);
      gradient.addColorStop(1, this.brandColors.forest);
      ctx.fillStyle = gradient;
    } else if (colorScheme === 'lemon') {
      ctx.fillStyle = this.brandColors.lemon;
    } else {
      ctx.fillStyle = this.brandColors.forest;
    }
    ctx.fillRect(0, 0, width, height);

    // Add subtle texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 20) {
      ctx.fillRect(i, 0, 1, height);
    }
  }

  private drawFlyerContent(ctx: CanvasRenderingContext2D, width: number, height: number, options: ImageGenerationOptions) {
    const padding = 60;
    
    // Logo area (top left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillText('Recipe Labs', padding, padding + 30);

    // Main headline
    ctx.fillStyle = '#0f1410';
    ctx.font = 'bold 48px Orbitron, sans-serif';
    const titleLines = this.wrapText(ctx, options.title, width - padding * 2, 48);
    let yPos = padding + 120;
    titleLines.forEach((line, i) => {
      ctx.fillText(line, padding, yPos + i * 60);
    });

    // Description
    yPos += titleLines.length * 60 + 40;
    ctx.fillStyle = 'rgba(15, 20, 16, 0.8)';
    ctx.font = '20px Montserrat, sans-serif';
    const descLines = this.wrapText(ctx, options.description, width - padding * 2, 20);
    descLines.forEach((line, i) => {
      ctx.fillText(line, padding, yPos + i * 28);
    });

    // Key benefits box
    yPos += descLines.length * 28 + 60;
    ctx.fillStyle = 'rgba(106, 142, 107, 0.3)';
    ctx.fillRect(padding, yPos, width - padding * 2, 200);
    
    ctx.fillStyle = '#0f1410';
    ctx.font = '18px Montserrat, sans-serif';
    const benefits = [
      '✓ AI-Powered Creative Solutions',
      '✓ Accelerated Content Creation',
      '✓ Innovative Design Workflows',
    ];
    benefits.forEach((benefit, i) => {
      ctx.fillText(benefit, padding + 20, yPos + 40 + i * 50);
    });

    // CTA Button
    yPos = height - padding - 80;
    ctx.fillStyle = this.brandColors.lemon;
    ctx.fillRect(padding, yPos, 250, 60);
    
    ctx.fillStyle = this.brandColors.forest;
    ctx.font = 'bold 24px Orbitron, sans-serif';
    const ctaText = options.callToAction;
    const ctaWidth = ctx.measureText(ctaText).width;
    ctx.fillText(ctaText, padding + (250 - ctaWidth) / 2, yPos + 40);
  }

  private drawInstagramContent(ctx: CanvasRenderingContext2D, width: number, height: number, options: ImageGenerationOptions) {
    const padding = 80;
    
    // Title (centered, large)
    ctx.fillStyle = '#0f1410';
    ctx.font = 'bold 64px Orbitron, sans-serif';
    const titleLines = this.wrapText(ctx, options.title, width - padding * 2, 64);
    let yPos = padding + 100;
    titleLines.forEach((line, i) => {
      const textWidth = ctx.measureText(line).width;
      ctx.fillText(line, (width - textWidth) / 2, yPos + i * 80);
    });

    // Description (centered)
    yPos += titleLines.length * 80 + 60;
    ctx.fillStyle = 'rgba(15, 20, 16, 0.9)';
    ctx.font = '28px Montserrat, sans-serif';
    const descLines = this.wrapText(ctx, options.description, width - padding * 2, 28);
    descLines.forEach((line, i) => {
      const textWidth = ctx.measureText(line).width;
      ctx.fillText(line, (width - textWidth) / 2, yPos + i * 40);
    });

    // CTA Button (centered, bottom)
    yPos = height - padding - 100;
    ctx.fillStyle = this.brandColors.lemon;
    const buttonWidth = 300;
    const buttonHeight = 70;
    ctx.fillRect((width - buttonWidth) / 2, yPos, buttonWidth, buttonHeight);
    
    ctx.fillStyle = this.brandColors.forest;
    ctx.font = 'bold 28px Orbitron, sans-serif';
    const ctaText = options.callToAction;
    const ctaWidth = ctx.measureText(ctaText).width;
    ctx.fillText(ctaText, (width - ctaWidth) / 2, yPos + 45);
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
    ctx.font = ctx.font.replace(/\d+px/, `${fontSize}px`);
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}

export const imageGeneratorService = new ImageGeneratorService();


