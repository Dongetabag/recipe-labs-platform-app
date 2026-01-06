// Recipe Labs Media Agent Page
// Similar to mh5-flyer-engine but for Recipe Labs branding

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft } from '../../../components/icons.tsx';
import MediaImageUploader from './MediaImageUploader';
import MediaProductGrid from './MediaProductGrid';
import { MediaProductType, MediaAppStatus, MediaBatchItem, MediaChatMessage, MediaDesignSpec } from '../../types/mediaTypes';
import { MEDIA_PRODUCTS } from '../../constants/mediaProducts';
import { generateProductImage, processDesignChat, generateCategorySuggestions, editGeneratedImage } from '../../services/mediaAgentService';

const CURATED_FONTS = [
  { id: 'orbitron', name: 'Orbitron', description: 'Modern, tech-forward, bold' },
  { id: 'montserrat', name: 'Montserrat', description: 'Clean, professional, versatile' },
  { id: 'inter', name: 'Inter', description: 'Modern, readable, neutral' },
  { id: 'poppins', name: 'Poppins', description: 'Friendly, geometric, approachable' },
  { id: 'space', name: 'Space Grotesk', description: 'Tech, geometric, contemporary' }
];

interface MediaAgentPageProps {
  onNavigate: (page: 'dashboard') => void;
}

const MediaAgentPage: React.FC<MediaAgentPageProps> = ({ onNavigate }) => {
  const defaultDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }, []);

  const [batch, setBatch] = useState<MediaBatchItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MediaProductType | null>(MEDIA_PRODUCTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [remixTemplate, setRemixTemplate] = useState<string | null>(null);
  
  // Custom Edit State
  const [activeRefineId, setActiveRefineId] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<MediaChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [designSpec, setDesignSpec] = useState<MediaDesignSpec>({ 
    date: defaultDate,
    includeDate: false,
    fontFamily: 'Orbitron',
    fontWeight: 'Bold',
    letterSpacing: 'Normal'
  });
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{title: string, spec: Partial<MediaDesignSpec>}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addToLog = useCallback((msg: string) => {
    setProcessingLog(prev => [msg, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, processingLog]);

  useEffect(() => {
    if (selectedProduct) {
      loadSuggestions(selectedProduct);
    }
  }, [selectedProduct]);

  const loadSuggestions = async (product: MediaProductType) => {
    addToLog(`DIRECTOR: ANALYZING_${product.id.toUpperCase()}_PROTOCOLS`);
    try {
      const result = await generateCategorySuggestions(product, designSpec);
      setSuggestions(result);
    } catch (err) {
      addToLog(`DIRECTOR: SUGGESTION_FAULT`);
    }
  };

  const applySuggestion = (s: {title: string, spec: Partial<MediaDesignSpec>}) => {
    setDesignSpec(prev => ({ ...prev, ...s.spec }));
    setChatHistory(prev => [...prev, { 
      role: 'assistant', 
      content: `DIRECTOR: Protocol "${s.title}" locked. Applied specialized ${selectedProduct?.name} blueprint.`, 
      timestamp: Date.now() 
    }]);
    addToLog(`BRAND_PROTOCOL: ${s.title}`);
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }]);
    setIsChatLoading(true);

    if (activeRefineId) {
      addToLog(`AGENT: PROCESSING_EDIT_REQUEST_${activeRefineId}...`);
      const targetItem = batch.find(i => i.id === activeRefineId);
      if (targetItem && targetItem.resultUrl) {
        try {
          const product = MEDIA_PRODUCTS.find(p => p.id === targetItem.targetProductId) || MEDIA_PRODUCTS[0];
          // Use original source image if available, otherwise use rendered result
          const sourceImage = targetItem.sourceUrl || targetItem.resultUrl;
          const refinedResult = await editGeneratedImage(
            targetItem.resultUrl, 
            userMsg, 
            product, 
            designSpec,
            sourceImage // Pass original source for better regeneration
          );
          
          setBatch(prev => prev.map(i => 
            i.id === activeRefineId ? { 
              ...i, 
              resultUrl: refinedResult, 
              status: MediaAppStatus.COMPLETED,
              sourceUrl: i.sourceUrl // Preserve original source
            } : i
          ));
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: `AGENT: Refinement complete. Applied "${userMsg}" to ${activeRefineId}. Check Studio Archive for updated asset.`, 
            timestamp: Date.now() 
          }]);
          addToLog(`AGENT: EDIT_APPLIED_${activeRefineId}`);
          setActiveRefineId(null); // Exit refine mode after successful edit
        } catch (err: any) {
          addToLog(`AGENT: EDIT_FAULT: ${err.message}`);
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: `AGENT: Error during refinement: ${err.message}. Please try a different edit instruction.`, 
            timestamp: Date.now() 
          }]);
        } finally {
          setIsChatLoading(false);
        }
        return;
      }
    }

    addToLog(`DIRECTOR: CONSULTING_TERMINAL...`);
    try {
      const { updatedSpec, assistantResponse } = await processDesignChat(userMsg, chatHistory, designSpec);
      setDesignSpec(updatedSpec);
      setChatHistory(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: Date.now() }]);
      addToLog(`DIRECTOR: SPEC_SYNCED`);
    } catch (err) {
      addToLog(`DIRECTOR: COMMS_FAULT`);
    } finally {
      setIsChatLoading(false);
    }
  };

  const processItem = async (item: MediaBatchItem, product: MediaProductType) => {
    setBatch(prev => prev.map(i => i.id === item.id ? { ...i, status: MediaAppStatus.PROCESSING, error: null, targetProductId: product.id } : i));
    addToLog(`KERNEL: RENDERING_${item.id}_${product.aspectRatio}`);
    try {
      const result = await generateProductImage(item.sourceUrl, product, designSpec, item.individualItemContext, 'image/png', item.isRemixing ? remixTemplate : null);
      setBatch(prev => prev.map(i => i.id === item.id ? { ...i, status: MediaAppStatus.COMPLETED, resultUrl: result, isRemixing: false } : i));
      addToLog(`KERNEL: VERIFIED_${item.id}`);
    } catch (err: any) {
      setBatch(prev => prev.map(i => i.id === item.id ? { ...i, status: MediaAppStatus.ERROR, error: err.message } : i));
      addToLog(`KERNEL: FAULT_${item.id}: ${err.message}`);
    }
  };

  const startBatchSynthesis = async () => {
    const idleItems = batch.filter(item => item.status === MediaAppStatus.IDLE || item.status === MediaAppStatus.ERROR);
    if (idleItems.length === 0) return;
    setIsProcessing(true);
    addToLog(`VAULT: INITIALIZING_BATCH`);
    for (const item of idleItems) {
      const product = MEDIA_PRODUCTS.find(p => p.id === item.targetProductId) || MEDIA_PRODUCTS[0];
      await processItem(item, product);
    }
    setIsProcessing(false);
    addToLog(`VAULT: BATCH_READY`);
  };

  const handleImagesSelected = (base64Array: string[], productOverride?: MediaProductType) => {
    const activeProduct = productOverride || selectedProduct;
    if (!activeProduct) return;
    const newItems: MediaBatchItem[] = base64Array.filter(b => b.startsWith('data:image')).map(base64 => ({
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      sourceUrl: base64,
      resultUrl: null,
      status: MediaAppStatus.IDLE,
      error: null,
      targetProductId: activeProduct.id,
      targetProductName: activeProduct.name,
      isRemixing: !!remixTemplate,
    }));
    setBatch(prev => [...prev, ...newItems]);
    addToLog(`VAULT: ADDED_${newItems.length}_PAYLOADS`);
    setRemixTemplate(null); 
  };

  const handleRemix = (item: MediaBatchItem) => {
    if (!item.resultUrl) return;
    setRemixTemplate(item.resultUrl);
    addToLog(`VAULT: TEMPLATE_LOCK_${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefine = (id: string) => {
    setActiveRefineId(id);
    const item = batch.find(i => i.id === id);
    const productName = item?.targetProductName || 'asset';
    setChatHistory(prev => [...prev, { 
      role: 'assistant', 
      content: `AGENT: ${productName} (${id}) is on the workbench. I'm ready for your edit instructions.\n\nExamples:\n• "Make it darker" - darker colors and overlay\n• "Move text to top" - reposition branding\n• "Bigger text" - increase font size\n• "Remove date" - hide date display\n• "More vibrant colors" - brighter palette\n• "Change font to Montserrat" - update typography\n\nWhat would you like to change?`, 
      timestamp: Date.now() 
    }]);
    addToLog(`AGENT: REFINE_MODE_ACTIVE_${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeItem = (id: string) => {
    setBatch(prev => prev.filter(item => item.id !== id));
    if (activeRefineId === id) setActiveRefineId(null);
    addToLog(`VAULT: PURGED_${id}`);
  };

  const clearAll = () => { 
    setBatch([]); 
    setProcessingLog([]); 
    setActiveRefineId(null);
    addToLog(`VAULT: SYSTEM_FLUSH`); 
  };

  const updateSpec = (updates: Partial<MediaDesignSpec>) => setDesignSpec(prev => ({ ...prev, ...updates }));

  const stats = useMemo(() => ({
    total: batch.length,
    completed: batch.filter(b => b.status === MediaAppStatus.COMPLETED).length,
    pending: batch.filter(b => b.status === MediaAppStatus.PROCESSING).length,
    idle: batch.filter(b => b.status === MediaAppStatus.IDLE).length,
  }), [batch]);

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-brand-bg text-white selection:bg-brand-lemon selection:text-brand-bg antialiased">
      {/* Header */}
      <header className="relative z-40 bg-brand-bg-secondary/80 backdrop-blur-md border-b border-brand-border flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-brand-text-muted hover:text-brand-lemon transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-tech">Dashboard</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg text-white flex items-center justify-center font-black text-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}>
                RL
              </div>
              <div>
                <h1 className="text-xl font-display font-bold gradient-text">Media Engine</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-brand-lemon rounded-full animate-pulse"></span>
                  <p className="text-[9px] text-brand-text-muted font-bold tracking-widest uppercase">Agent Node: Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-[1400px]">
        <div className="grid lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="space-y-1 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 ${stats.pending > 0 || activeRefineId ? 'bg-brand-lemon animate-ping' : 'bg-brand-text-muted'}`}></span>
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-brand-text-muted">Recipe Labs Studio // v2.0_AGENT</span>
              </div>
              <h2 className="text-6xl font-display font-bold uppercase tracking-tighter leading-none text-white select-none text-balance gradient-text">Media<br/>Engine</h2>
            </div>

            <div className={`space-y-6 bg-brand-bg-tertiary border p-8 rounded-lg backdrop-blur-3xl relative shadow-2xl transition-all ${activeRefineId ? 'border-brand-lemon ring-1 ring-brand-lemon/20' : 'border-brand-border'}`}>
              <MediaImageUploader onImagesSelected={(imgs) => handleImagesSelected(imgs)} hasImages={batch.length > 0} label={remixTemplate ? "Media for Master Remix" : "1. Load Studio Assets"} />

              {/* Step 2: Agent Refinery */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">
                    {activeRefineId ? 'AGENT: EDIT_SESSION_ID_' + activeRefineId : '2. Design Agent'}
                  </label>
                  {activeRefineId && (
                    <button onClick={() => setActiveRefineId(null)} className="text-[8px] font-black text-brand-lemon hover:text-white uppercase tracking-widest bg-brand-lemon/10 px-2 py-1 rounded-lg border border-brand-lemon/20 transition-all">Exit Refinery</button>
                  )}
                </div>
                <div className={`bg-brand-bg border rounded-lg overflow-hidden flex flex-col h-80 shadow-2xl transition-all ${activeRefineId ? 'border-brand-lemon shadow-brand-lemon/10' : 'border-brand-border'}`}>
                   <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-[9px] scroll-smooth">
                     {chatHistory.length === 0 ? (
                       <div className="text-brand-text-muted italic border-l-2 border-brand-border pl-4 py-2 bg-brand-bg-tertiary">
                         "Agent online. Define brand protocols or load an asset to refine."
                       </div>
                     ) : (
                       chatHistory.map((msg, i) => (
                         <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <span className="text-[7px] text-brand-text-dim mb-1 uppercase tracking-widest">{msg.role === 'user' ? 'CLIENT' : 'AGENT_RL'}</span>
                           <div className={`max-w-[85%] p-3 rounded-lg leading-relaxed ${msg.role === 'user' ? 'bg-brand-bg-tertiary text-white border border-brand-border' : 'bg-brand-lemon text-brand-bg font-bold shadow-xl'}`}>
                             {msg.content}
                           </div>
                         </div>
                       ))
                     )}
                     <div ref={chatEndRef} />
                   </div>
                   
                   {suggestions.length > 0 && !activeRefineId && (
                     <div className="px-5 py-3 border-t border-brand-border bg-brand-bg-tertiary">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {suggestions.map((s, idx) => (
                            <button key={idx} onClick={() => applySuggestion(s)} className="shrink-0 px-4 py-2 bg-brand-bg border border-brand-border hover:border-brand-lemon/50 hover:bg-brand-bg-secondary rounded-lg text-[8px] font-black uppercase tracking-[0.1em] text-white transition-all active:scale-95 whitespace-nowrap">{s.title}</button>
                          ))}
                        </div>
                     </div>
                   )}
                   
                   <form onSubmit={handleChatSubmit} className="border-t border-brand-border flex bg-brand-bg">
                     <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={activeRefineId ? "Describe your edit (e.g. 'Make it darker', 'Move text to center', 'Bigger font')..." : "Enter design protocol..."} className="flex-1 bg-transparent px-5 py-4 text-[10px] uppercase font-mono text-white outline-none placeholder:text-brand-text-dim" />
                     <button type="submit" disabled={isChatLoading} className={`px-6 font-black uppercase text-[10px] disabled:opacity-50 transition-colors ${activeRefineId ? 'bg-brand-lemon text-brand-bg' : 'bg-brand-lemon text-brand-bg'}`}>
                       {activeRefineId ? 'Apply' : 'Sync'}
                     </button>
                   </form>
                </div>
              </div>

              {/* Step 3: Typography & Date Node */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">3. Typography & Global</label>
                   <button 
                     onClick={() => updateSpec({ includeDate: !designSpec.includeDate })} 
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${designSpec.includeDate ? 'bg-brand-lemon border-brand-lemon text-brand-bg' : 'bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-lemon/30'}`}
                   >
                     <span className={`w-1.5 h-1.5 rounded-full ${designSpec.includeDate ? 'bg-brand-bg animate-pulse' : 'bg-brand-text-dim'}`}></span>
                     <span className="text-[8px] font-black uppercase tracking-widest">Auto_Date</span>
                   </button>
                </div>
                <div className="grid gap-3">
                  <select 
                    value={designSpec.fontFamily}
                    onChange={(e) => updateSpec({ fontFamily: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-[10px] uppercase font-black tracking-widest outline-none focus:border-brand-lemon transition-all text-white"
                  >
                    {CURATED_FONTS.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select value={designSpec.fontWeight} onChange={(e) => updateSpec({ fontWeight: e.target.value })} className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-[10px] uppercase font-black outline-none text-white">{['Light', 'Regular', 'Bold', 'Black'].map(w => <option key={w} value={w}>{w}</option>)}</select>
                    <select value={designSpec.letterSpacing} onChange={(e) => updateSpec({ letterSpacing: e.target.value })} className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-[10px] uppercase font-black outline-none text-white">{['Tight', 'Normal', 'Wide', 'Ultra-Wide'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                </div>
              </div>
              
              <MediaProductGrid selectedId={selectedProduct?.id || null} onSelect={(p) => setSelectedProduct(p)} onFilesDropped={(imgs, p) => handleImagesSelected(imgs, p)} />

              {stats.total > 0 && (
                <div className="pt-6 border-t border-brand-border space-y-4">
                   <button onClick={startBatchSynthesis} disabled={isProcessing || stats.idle === 0} className={`w-full py-6 rounded-lg font-black text-sm uppercase tracking-[0.5em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 ${stats.idle > 0 ? 'bg-brand-lemon text-brand-bg hover:bg-brand-lemon/90' : 'bg-brand-bg-tertiary text-brand-text-dim border border-brand-border cursor-not-allowed'}`}>
                     {isProcessing ? <><div className="w-4 h-4 border-2 border-brand-bg border-t-transparent rounded-full animate-spin"></div>Synthesizing...</> : `EXECUTE_VAULT [${stats.idle}]`}
                   </button>
                   <button onClick={clearAll} className="w-full py-2 text-[9px] font-black uppercase tracking-[0.5em] text-brand-text-dim hover:text-red-500 transition-colors">Emergency Flush</button>
                </div>
              )}
            </div>

            <div className="bg-brand-bg border border-brand-border p-6 rounded-lg font-mono text-[9px] text-brand-text-muted space-y-3 uppercase tracking-tight h-44 flex flex-col shadow-inner">
              <div className="border-b border-brand-border pb-3 flex justify-between uppercase">
                <span className="text-brand-text-dim">Studio_Kernel_v2.0</span>
                <span className={stats.pending > 0 || activeRefineId ? 'animate-pulse text-brand-lemon' : 'opacity-10'}>●</span>
              </div>
              <div className="overflow-y-auto flex-1 space-y-1 py-2 scroll-smooth">
                {processingLog.map((log, i) => <div key={i} className={i === 0 ? 'text-brand-lemon' : 'opacity-30'}>{`> ${log}`}</div>)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="flex justify-between items-end border-b border-brand-border pb-8">
               <div className="flex items-center gap-10">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-[0.8em] text-white italic select-none">Studio_Archive</h3>
                  <div className="flex gap-4">
                    <span className="bg-brand-bg-tertiary text-brand-text-muted text-[9px] px-5 py-2.5 rounded-lg font-black border border-brand-border uppercase tracking-widest">QUEUED: {stats.idle}</span>
                    <span className="bg-brand-lemon text-brand-bg text-[9px] px-5 py-2.5 rounded-lg font-black border border-brand-lemon uppercase tracking-widest">RENDERED: {stats.completed}</span>
                  </div>
               </div>
            </div>

            {batch.length === 0 ? (
              <div className="h-[800px] border border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center bg-brand-bg-tertiary group relative overflow-hidden">
                <div className="text-[320px] font-display font-bold tracking-tighter leading-none select-none opacity-[0.02] group-hover:opacity-[0.04] transition-opacity text-white absolute">RL</div>
                <p className="font-black uppercase tracking-[2em] text-[11px] opacity-20 relative z-10">Waiting for Payload</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-12">
                {batch.map((item) => {
                  const product = MEDIA_PRODUCTS.find(p => p.id === item.targetProductId) || MEDIA_PRODUCTS[0];
                  const aspectRatioClass = product.aspectRatio === '9:16' ? 'aspect-[9/16]' : product.aspectRatio === '1:1' ? 'aspect-square' : product.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[3/4]';
                  const isBeingRefined = activeRefineId === item.id;
                  
                  return (
                    <div key={item.id} className={`group relative bg-brand-bg-secondary border rounded-lg overflow-hidden flex flex-col transition-all shadow-2xl ${isBeingRefined ? 'border-brand-lemon scale-[1.02] z-40' : 'border-brand-border hover:border-brand-lemon/50'}`}>
                      <div className={`relative overflow-hidden bg-brand-bg ${aspectRatioClass}`}>
                        {!item.resultUrl ? (
                          <div className={`w-full h-full p-12 flex flex-col items-center justify-center transition-opacity ${item.status === MediaAppStatus.PROCESSING ? 'opacity-20' : 'opacity-70 group-hover:opacity-90'}`}>
                            {item.sourceUrl ? (
                              <img src={item.sourceUrl} className="max-w-full max-h-[90%] object-contain" alt="Payload" />
                            ) : (
                              <div className="text-brand-text-muted uppercase font-black tracking-widest text-[9px]">NO_SOURCE</div>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <img src={item.resultUrl} className="w-full h-full object-cover transition-transform duration-[60s] group-hover:scale-110" alt="Studio Asset" />
                          </div>
                        )}
                        
                        {(item.status === MediaAppStatus.PROCESSING || (isBeingRefined && isChatLoading)) && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-10 bg-brand-bg/95 backdrop-blur-3xl text-center">
                            <div className="w-20 h-20 border-b-4 border-brand-lemon rounded-full animate-spin shadow-[0_0_50px_rgba(245,213,71,0.3)] mx-auto"></div>
                            <span className="text-[12px] font-black uppercase tracking-[0.8em] text-white animate-pulse block mt-4">
                              {isBeingRefined ? 'Synthesizing_Edits...' : 'Rendering_Asset...'}
                            </span>
                          </div>
                        )}

                        <div className="absolute top-6 left-6 right-6 z-30 flex justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0">
                           <div className="bg-brand-bg/95 p-3.5 border border-brand-border flex items-center gap-5 backdrop-blur-md shadow-2xl">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none italic">ID_{item.id} // {product.aspectRatio}</span>
                           </div>
                           <div className="flex gap-3">
                             {item.status === MediaAppStatus.COMPLETED && (
                               <>
                                 <button onClick={() => handleRefine(item.id)} title="Edit with AI Agent - Refine this design" className="w-14 h-14 bg-brand-lemon text-brand-bg flex items-center justify-center hover:bg-brand-lemon/90 transition-all border border-brand-lemon/20 active:scale-90 shadow-2xl group relative">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-brand-bg text-white text-[8px] px-3 py-1.5 rounded-lg border border-brand-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black uppercase tracking-widest shadow-xl z-50">Edit with AI</span>
                                 </button>
                                 <button onClick={() => handleRemix(item)} title="Master Remix Template" className="w-14 h-14 bg-brand-bg border border-brand-border flex items-center justify-center hover:bg-brand-bg-tertiary transition-all text-white active:scale-90 shadow-2xl">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                 </button>
                               </>
                             )}
                             <button onClick={() => removeItem(item.id)} className="w-14 h-14 bg-brand-bg/95 border border-brand-border flex items-center justify-center hover:bg-red-950 transition-all text-white active:scale-90 shadow-2xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                           </div>
                        </div>
                      </div>
                      <div className={`p-8 border-t bg-brand-bg-secondary space-y-6 transition-colors ${isBeingRefined ? 'border-brand-lemon/30' : 'border-brand-border'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-5">
                             <div className={`w-2.5 h-2.5 rounded-full ${isBeingRefined ? 'bg-brand-lemon animate-pulse shadow-[0_0_20px_#F5D547]' : item.status === MediaAppStatus.COMPLETED ? 'bg-green-500 shadow-[0_0_30px_#22c55e]' : item.status === MediaAppStatus.PROCESSING ? 'bg-brand-lemon animate-ping' : 'bg-brand-text-dim'}`}></div>
                             <span className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">{isBeingRefined ? 'AGENT_NODE_REFINING' : product.name} // {item.status === MediaAppStatus.COMPLETED ? 'Verified' : 'Pending'}</span>
                          </div>
                          {item.resultUrl && <a href={item.resultUrl} download={`RecipeLabs_${product.id.toUpperCase()}_${item.id}.png`} className="text-[11px] font-black text-brand-text-muted hover:text-brand-lemon uppercase tracking-widest transition-colors flex items-center gap-3">Export_HQ <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8l-8 8-8-8" strokeWidth="3" /></svg></a>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-40 border-t border-brand-border mt-40 opacity-10 hover:opacity-50 transition-opacity">
        <div className="container mx-auto px-4 text-center">
          <div className="text-7xl font-display font-bold tracking-tighter text-white uppercase select-none gradient-text">Recipe Labs Worldwide</div>
          <p className="text-[11px] uppercase tracking-[1.8em] text-brand-text-muted mt-10">Pure Media Production // v2.0 Agent Refinery</p>
        </div>
      </footer>
    </div>
  );
};

export default MediaAgentPage;

