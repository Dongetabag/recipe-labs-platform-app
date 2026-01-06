import React, { useRef, useState } from 'react';
import { MEDIA_PRODUCTS } from '../../constants/mediaProducts';
import { MediaProductType } from '../../types/mediaTypes';

interface MediaProductGridProps {
  selectedId: string | null;
  onSelect: (product: MediaProductType) => void;
  onFilesDropped: (files: string[], product: MediaProductType) => void;
}

const MediaProductGrid: React.FC<MediaProductGridProps> = ({ selectedId, onSelect, onFilesDropped }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDropId, setActiveDropId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, product: MediaProductType) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files), product);
    }
  };

  const processFiles = (files: File[], product: MediaProductType) => {
    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      onFilesDropped(results, product);
    });
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setActiveDropId(id);
  };

  const handleDragLeave = () => {
    setActiveDropId(null);
  };

  const handleDrop = (e: React.DragEvent, product: MediaProductType) => {
    e.preventDefault();
    setActiveDropId(null);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      processFiles(files, product);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">
          4. Select or Drop to Format
        </label>
        <span className="text-[8px] font-mono text-brand-text-dim uppercase">Input_Nodes_Ready</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MEDIA_PRODUCTS.map((product) => (
          <div key={product.id} className="relative group">
            <button
              onClick={() => onSelect(product)}
              onDragOver={(e) => handleDragOver(e, product.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, product)}
              className={`w-full p-4 rounded-lg border flex flex-col items-center gap-3 transition-all relative overflow-hidden
                ${selectedId === product.id 
                  ? 'bg-brand-lemon border-brand-lemon text-brand-bg shadow-xl ring-4 ring-brand-lemon/20 scale-[1.02] z-10' 
                  : 'bg-brand-bg-tertiary border-brand-border text-brand-text-muted hover:border-brand-lemon/50 hover:bg-brand-bg-secondary'}
                ${activeDropId === product.id ? 'border-brand-lemon bg-brand-lemon/20 scale-105' : ''}`}
            >
              <span className={`text-2xl transition-transform duration-300 group-hover:scale-125 ${selectedId === product.id ? 'grayscale-0' : 'grayscale'}`}>
                {product.icon}
              </span>
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] block leading-none">{product.name}</span>
                <span className={`text-[7px] uppercase tracking-widest mt-1.5 block opacity-60`}>
                  Drop Asset Here
                </span>
              </div>

              {activeDropId === product.id && (
                <div className="absolute inset-0 bg-brand-lemon/90 flex items-center justify-center text-brand-bg font-black text-[10px] uppercase tracking-widest">
                  Release File
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaProductGrid;


