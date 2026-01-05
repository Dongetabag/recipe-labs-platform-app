import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// Fix: Add .tsx file extension for component imports
import { User, Check, ArrowRight, Palette, Edit3, Compass, Users, Shield, Target, FlaskConical, Brain, Grid, ClipboardList, Spectrum, ArrowLeft, MapPin, Star, Zap, Award, Coffee, Rocket, Crown, Code, Wrench } from './icons.tsx';
import AnimatedProgressBar from './AnimatedProgressBar.tsx';
import ColorPicker from './ColorPicker.tsx';

export type IntakeData = {
  name: string;
  role: 'Founder' | 'Lead Developer' | 'AI Engineer' | 'Operations';
  department: string;
  specialization: string;
  currentProjects: string;
  primaryFocus: string;
  workStyle: string;
  toolExpertise: string;
  primaryGoals: string[];
  weeklyPriority: string;
  platformTheme: string;
  toolLayout: 'grid' | 'list';
}

interface IntakeModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: IntakeData) => void;
}

// --- Color Conversion Utilities ---
const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  s /= 100; v /= 100;
  const i = Math.floor((h / 360) * 6);
  const f = (h / 360) * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r=0, g=0, b=0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Recipe Labs Team Roles
const teamRoles: {name: IntakeData['role'], icon: React.ReactNode, description: string}[] = [
    { name: 'Founder', icon: <Crown className="w-8 h-8 mb-2" />, description: 'Leadership & Vision' },
    { name: 'Lead Developer', icon: <Code className="w-8 h-8 mb-2" />, description: 'Technical Architecture' },
    { name: 'AI Engineer', icon: <Brain className="w-8 h-8 mb-2" />, description: 'AI/ML Systems' },
    { name: 'Operations', icon: <Wrench className="w-8 h-8 mb-2" />, description: 'Process & Delivery' },
];

// Recipe Labs Departments
const departmentOptions: {name: string, icon: React.ReactNode}[] = [
    { name: 'Product Development', icon: <Rocket className="w-6 h-6" /> },
    { name: 'AI & Automation', icon: <Brain className="w-6 h-6" /> },
    { name: 'Client Solutions', icon: <Users className="w-6 h-6" /> },
    { name: 'Growth & Strategy', icon: <Target className="w-6 h-6" /> },
];

// Goals specific to Recipe Labs internal work
const goalOptions = ['Ship Product Features', 'Build AI Workflows', 'Client Delivery Excellence', 'Scale Internal Systems', 'Improve Documentation', 'Automate Processes'];

const PRESET_THEMES = ['violet', 'blue', 'green', 'aqua'];
const THEME_COLORS: { [key: string]: string } = {
  violet: '#6A44FF',
  blue: '#1E3AFF',
  green: '#4FFF7B',
  aqua: '#2BFFC2',
};


const IntakeModal: React.FC<IntakeModalProps> = ({ show, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState<IntakeData['role']>('Founder');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [currentProjects, setCurrentProjects] = useState('');
  const [primaryFocus, setPrimaryFocus] = useState('');
  const [workStyle, setWorkStyle] = useState('');
  const [toolExpertise, setToolExpertise] = useState('');
  const [primaryGoals, setPrimaryGoals] = useState<string[]>([]);
  const [weeklyPriority, setWeeklyPriority] = useState('');
  const [platformTheme, setPlatformTheme] = useState<IntakeData['platformTheme']>('green');
  const [toolLayout, setToolLayout] = useState<IntakeData['toolLayout']>('grid');
  const [error, setError] = useState('');
  
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const hueRef = useRef<HTMLDivElement>(null);
  
  const isCustomColor = useMemo(() => !PRESET_THEMES.includes(platformTheme), [platformTheme]);
  const activeColorHex = useMemo(() => THEME_COLORS[platformTheme] || platformTheme, [platformTheme]);

  const currentHue = useMemo(() => {
    const { r, g, b } = hexToRgb(activeColorHex);
    const { h } = rgbToHsv(r, g, b);
    return h;
  }, [activeColorHex]);
  
  const handleHueChange = useCallback((e: MouseEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newHue = (x / rect.width) * 360;
      // Use full saturation and brightness for a vibrant color from the hue slider
      const { r, g, b } = hsvToRgb(newHue, 100, 100);
      setPlatformTheme(rgbToHex(r, g, b));
  }, []);

  const createDragHandler = useCallback((handler: (e: MouseEvent) => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      handler(e.nativeEvent);
      const onMouseMove = (moveEvent: MouseEvent) => handler(moveEvent);
      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  }, []);


  if (!show) return null;
  
  const handleGoalToggle = (goal: string) => {
    setPrimaryGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };
  
  const handleNext = () => {
    // Validation removed to allow skipping sections.
    setError('');
    setStep(s => s + 1);
  };
  
  const handleBack = () => {
      setError('');
      setStep(s => s - 1);
  };

  const handleSubmit = () => {
    // Validation removed to allow skipping sections.
    setError('');
    onSubmit({ name, role, department, specialization, currentProjects, primaryFocus, workStyle, toolExpertise, primaryGoals, weeklyPriority, platformTheme, toolLayout });
  };

  const renderStepContent = () => {
      const inputClasses = "w-full bg-brand-bg-tertiary border border-brand-border py-2.5 px-4 text-white placeholder-brand-text-dim focus:ring-2 focus:ring-brand-lemon/50 focus:border-brand-lemon/50 rounded-lg transition-all duration-200 font-tech";
      const textareaClasses = "w-full h-24 bg-brand-bg-tertiary border border-brand-border p-2.5 text-white placeholder-brand-text-dim focus:ring-2 focus:ring-brand-lemon/50 resize-none rounded-lg transition-all duration-200 font-tech";

      switch(step) {
          case 1:
              return (
                  <div className="animate-fadeIn space-y-6">
                      <h3 className="text-xl font-semibold text-center text-brand-lemon font-tech tracking-widest">STEP 1: TEAM MEMBER SETUP</h3>
                      <p className="text-center text-brand-text-muted text-sm -mt-4">Welcome to Recipe Labs Internal Platform</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">YOUR NAME</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">YOUR SPECIALIZATION</label>
                                <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g., Full-Stack, AI/ML, n8n, ComfyUI" className={inputClasses} />
                            </div>
                        </div>
                        <div className="space-y-6">
                           <div>
                                <label className="block text-sm font-medium text-brand-text-muted mb-2 font-tech text-center">UI PREFERENCES</label>
                                <div className="p-4 bg-brand-bg-tertiary border border-brand-border space-y-4 rounded-xl">
                                  <div>
                                    <label className="block text-xs font-medium text-brand-text-dim mb-3 font-tech">ACCENT COLOR</label>
                                    <div className="flex justify-around items-center">
                                      {PRESET_THEMES.map(color => (
                                        <button key={color} onClick={() => { setPlatformTheme(color); setShowCustomColorPicker(false); }} className={`w-10 h-10 rounded-full bg-brand-${color === 'blue' ? 'royal-blue' : color} transition-all ${platformTheme === color ? 'ring-2 ring-offset-2 ring-offset-brand-bg ring-brand-lemon' : ''}`} />
                                      ))}
                                      <button
                                        onClick={() => {
                                            setShowCustomColorPicker(prev => !prev);
                                            if (!isCustomColor) {
                                                setPlatformTheme(THEME_COLORS[platformTheme]);
                                            }
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${isCustomColor || showCustomColorPicker ? 'ring-2 ring-offset-2 ring-offset-brand-bg ring-brand-lemon border-transparent' : 'border-dashed border-brand-border'}`}
                                        style={{ background: isCustomColor ? platformTheme : 'transparent' }}
                                      >
                                        {!isCustomColor && <Spectrum className="w-8 h-8"/>}
                                      </button>
                                    </div>
                                    {showCustomColorPicker && (
                                        <div className="mt-4 pt-4 border-t border-brand-border space-y-3 animate-fadeIn">
                                            <div
                                                ref={hueRef}
                                                onMouseDown={createDragHandler(handleHueChange)}
                                                className="w-full h-4 cursor-pointer relative rounded-full"
                                                style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                                            >
                                                <div
                                                className="w-5 h-5 rounded-full border-2 border-white absolute shadow-md transform -translate-x-1/2 -translate-y-[calc(50%-2px)] bg-transparent"
                                                style={{ left: `${(currentHue / 360) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 flex-shrink-0 border border-brand-border rounded-md" style={{ backgroundColor: activeColorHex }} />
                                                <input
                                                  type="text"
                                                  value={activeColorHex.toUpperCase()}
                                                  readOnly
                                                  className="w-full bg-brand-bg border border-brand-border py-1 px-2 text-white font-mono tracking-wider text-sm rounded-md"
                                                />
                                            </div>
                                        </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-brand-text-dim mb-2 font-tech">TOOL LAYOUT</label>
                                     <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setToolLayout('grid')} className={`flex items-center justify-center gap-2 p-2 border-2 transition-all rounded-lg ${toolLayout === 'grid' ? 'border-brand-lemon bg-brand-lemon/10 text-white' : 'border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-lemon/50'}`}>
                                            <Grid className="w-5 h-5" /> Grid
                                        </button>
                                         <button onClick={() => setToolLayout('list')} className={`flex items-center justify-center gap-2 p-2 border-2 transition-all rounded-lg ${toolLayout === 'list' ? 'border-brand-lemon bg-brand-lemon/10 text-white' : 'border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-lemon/50'}`}>
                                            <ClipboardList className="w-5 h-5" /> List
                                        </button>
                                    </div>
                                  </div>
                                </div>
                           </div>
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-brand-text-muted mb-2 font-tech text-center">SELECT YOUR ROLE</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {teamRoles.map(r => (
                                  <button key={r.name} onClick={() => setRole(r.name)} className={`group flex flex-col items-center justify-center p-4 text-sm border-2 transition-all h-28 rounded-xl ${role === r.name ? 'border-brand-lemon bg-brand-lemon/10 text-white' : 'border-brand-border bg-brand-bg-tertiary text-brand-text-muted hover:border-brand-lemon/50 hover:bg-brand-bg'}`}>
                                      {r.icon}
                                      <span className="font-semibold mt-1">{r.name}</span>
                                      <span className="text-xs text-brand-text-dim">{r.description}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-brand-text-muted mb-2 font-tech text-center">SELECT YOUR DEPARTMENT</label>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               {departmentOptions.map(d => (
                                   <button key={d.name} onClick={() => setDepartment(d.name)} className={`group flex flex-col items-center justify-center p-4 text-sm border-2 transition-all h-28 rounded-xl ${department === d.name ? 'border-brand-lemon bg-brand-lemon/10 text-white' : 'border-brand-border bg-brand-bg-tertiary text-brand-text-muted hover:border-brand-lemon/50 hover:bg-brand-bg'}`}>
                                       {d.icon}
                                       <span className="font-semibold mt-2 text-center">{d.name}</span>
                                   </button>
                               ))}
                           </div>
                      </div>
                  </div>
              );
          case 2:
              return (
                   <div className="animate-fadeIn space-y-6">
                      <h3 className="text-xl font-semibold text-center text-brand-lemon font-tech tracking-widest">STEP 2: WORK CONTEXT</h3>
                      <p className="text-center text-brand-text-muted text-sm -mt-4">Help the AI understand your work style</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">PRIMARY FOCUS AREA</label>
                            <input type="text" value={primaryFocus} onChange={e => setPrimaryFocus(e.target.value)} placeholder="e.g., Client Automation, Product Dev, AI Agents" className={inputClasses} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">WORK STYLE</label>
                            <input type="text" value={workStyle} onChange={e => setWorkStyle(e.target.value)} placeholder="e.g., Deep focus, Collaborative, Async" className={inputClasses} />
                        </div>
                      </div>
                       <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">TOOL EXPERTISE</label>
                            <input value={toolExpertise} onChange={e => setToolExpertise(e.target.value)} placeholder="e.g., n8n, ComfyUI, Claude, React, Python" className={inputClasses} />
                        </div>
                      <div>
                          <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">CURRENT PROJECTS (OPTIONAL)</label>
                          <textarea value={currentProjects} onChange={e => setCurrentProjects(e.target.value)} placeholder="What are you currently working on? List active projects, clients, or initiatives." className={textareaClasses} />
                      </div>
                  </div>
              );
          case 3:
              return (
                   <div className="animate-fadeIn space-y-6">
                      <h3 className="text-xl font-semibold text-center text-brand-lemon font-tech tracking-widest">STEP 3: GOALS & PRIORITIES</h3>
                      <p className="text-center text-brand-text-muted text-sm -mt-4">What do you want to achieve with this platform?</p>
                      <div>
                          <label className="block text-sm font-medium text-brand-text-muted mb-2 font-tech">SELECT YOUR PRIMARY GOALS</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {goalOptions.map(goal => (
                                  <button key={goal} onClick={() => handleGoalToggle(goal)} className={`flex items-center justify-between p-3 text-left text-sm transition-all rounded-lg ${primaryGoals.includes(goal) ? 'bg-brand-lemon/20 border border-brand-lemon text-brand-lemon' : 'bg-brand-bg-tertiary border border-brand-border hover:border-brand-lemon/30 text-brand-text-muted'}`}>
                                      <span>{goal}</span>
                                      {primaryGoals.includes(goal) && <Check className="w-4 h-4 text-brand-lemon" />}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">THIS WEEK'S TOP PRIORITY</label>
                          <input type="text" value={weeklyPriority} onChange={e => setWeeklyPriority(e.target.value)} placeholder="e.g., Finish client dashboard, Deploy n8n workflow, Ship feature X" className={inputClasses} />
                      </div>
                  </div>
              );
          default:
              return null;
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-brand-bg-secondary p-6 sm:p-8 border border-brand-border shadow-2xl shadow-brand-lemon/10 animate-scaleIn w-full max-w-3xl rounded-3xl text-white flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="text-center mb-6 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
             <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}>
               <FlaskConical className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-3xl font-bold font-orbitron gradient-text">Recipe Labs</h2>
          </div>
          <p className="text-brand-text-muted">Team Member Setup</p>
        </div>

        <div className="mb-6 flex-shrink-0">
            <AnimatedProgressBar value={step} max={3} color="lemon" />
        </div>

        <div className="overflow-y-auto pr-4 -mr-4 flex-grow py-2">
            {renderStepContent()}
        </div>

        {error && <p className="text-red-400 text-sm mt-4 text-center font-mono animate-pulse flex-shrink-0">{error}</p>}

        <div className="mt-8 flex justify-between items-center flex-shrink-0">
            <div>
                {step > 1 && (
                    <button onClick={handleBack} className="group relative flex justify-center items-center gap-2 px-6 py-3 border border-brand-lemon/50 text-brand-lemon font-bold hover:bg-brand-lemon/10 transition-all duration-200 rounded-lg">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                )}
            </div>
            <div>
                {step < 3 && (
                    <button onClick={handleNext} className="group relative flex justify-center items-center gap-2 px-6 py-3 text-brand-bg font-bold hover:shadow-lg hover:shadow-brand-lemon/30 transform hover:scale-105 transition-all duration-200 rounded-lg" style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 100%)' }}>
                        <span>Next Step</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
                {step === 3 && (
                    <button onClick={handleSubmit} className="w-full group relative flex justify-center items-center gap-2 px-6 py-4 text-brand-bg font-bold hover:shadow-lg hover:shadow-brand-lemon/30 transform hover:scale-105 transition-all duration-200 rounded-lg" style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}>
                        <span className="font-orbitron tracking-widest">LET'S BUILD</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeModal;