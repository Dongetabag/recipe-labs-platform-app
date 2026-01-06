import React, { useRef } from 'react';

interface MediaImageUploaderProps {
  onImagesSelected: (base64Array: string[]) => void;
  hasImages: boolean;
  label?: string;
}

const MediaImageUploader: React.FC<MediaImageUploaderProps> = ({ onImagesSelected, hasImages, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const readers = (Array.from(files) as File[]).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        onImagesSelected(results);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[10px] font-black text-brand-text-muted mb-3 uppercase tracking-[0.2em]">
        {label || "1. Load Media Assets"}
      </label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-lg transition-all h-40 flex flex-col items-center justify-center overflow-hidden
          ${hasImages ? 'border-brand-border bg-brand-bg-tertiary' : 'border-brand-border hover:border-brand-lemon/50 hover:bg-brand-bg-tertiary'}`}
      >
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-brand-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3 border border-brand-border group-hover:scale-110 transition-transform group-hover:border-brand-lemon/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-lemon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-white font-black uppercase tracking-widest text-[10px]">Select Base Media</p>
          <p className="text-brand-text-muted text-[9px] mt-1 uppercase tracking-tighter">AI will transform this into Recipe Labs branded content</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          multiple
          className="hidden" 
        />
      </div>
    </div>
  );
};

export default MediaImageUploader;


