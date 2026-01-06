// Flyer Generator Component
// Creates Recipe Labs branded flyers using AI

import React, { useState } from 'react';
import { designAgentService, DesignPrompt } from '../../services/designAgentService';

export function FlyerGenerator() {
  const [formData, setFormData] = useState<DesignPrompt>({
    type: 'flyer',
    title: '',
    description: '',
    callToAction: 'Get Started',
    colorScheme: 'gradient',
    style: 'modern',
    additionalInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ prompt: string; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof DesignPrompt, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.title && !formData.description) {
      setError('Please provide at least a title or description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const generated = await designAgentService.generateImage(formData);
      setResult(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flyer');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    // Create a downloadable text file with the prompt
    const blob = new Blob([result.prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-labs-flyer-prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-bg-secondary rounded-lg border border-brand-border p-6">
        <h2 className="text-2xl font-display font-bold text-white gradient-text mb-6">
          Flyer Generator
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Recipe Labs - AI Creative Suite"
              className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white placeholder-brand-text-dim focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the flyer content, key points, or message..."
              rows={4}
              className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white placeholder-brand-text-dim focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
            />
          </div>

          {/* Call to Action */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Call to Action
            </label>
            <input
              type="text"
              value={formData.callToAction}
              onChange={(e) => handleChange('callToAction', e.target.value)}
              placeholder="e.g., Get Started, Learn More, Contact Us"
              className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white placeholder-brand-text-dim focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
            />
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Color Scheme
            </label>
            <select
              value={formData.colorScheme}
              onChange={(e) => handleChange('colorScheme', e.target.value)}
              className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
            >
              <option value="gradient">Gradient (Lemon → Forest)</option>
              <option value="lemon">Lemon Yellow Focus</option>
              <option value="forest">Forest Green Focus</option>
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Style
            </label>
            <select
              value={formData.style}
              onChange={(e) => handleChange('style', e.target.value)}
              className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
              <option value="elegant">Elegant</option>
            </select>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={formData.additionalInstructions}
              onChange={(e) => handleChange('additionalInstructions', e.target.value)}
              placeholder="Any specific design requirements, elements to include, or special instructions..."
              rows={3}
              className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white placeholder-brand-text-dim focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.title}
            className="w-full px-6 py-3 bg-brand-lemon text-black rounded-lg font-medium hover:bg-brand-lemon-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Generating Flyer Design...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Generate Flyer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-brand-bg-secondary rounded-lg border border-brand-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-white">Generated Design Prompt</h3>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-brand-forest text-white rounded-lg hover:bg-brand-forest/80 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Prompt</span>
            </button>
          </div>
          <div className="bg-brand-bg-tertiary rounded-lg p-4 border border-brand-border">
            <pre className="text-sm text-brand-text-muted whitespace-pre-wrap font-mono">
              {result.prompt}
            </pre>
          </div>
          <div className="mt-4 p-4 bg-brand-lemon/10 border border-brand-lemon/30 rounded-lg">
            <p className="text-sm text-brand-text-muted">
              <strong className="text-brand-lemon">Note:</strong> This prompt can be used with image generation AI tools 
              (DALL-E, Midjourney, Stable Diffusion, or Google Imagen) to create the actual flyer design.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


