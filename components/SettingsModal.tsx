

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types.ts';
import { X, Save, Palette, Grid, ClipboardList, Spectrum, Sun, Moon } from './icons.tsx';
import ColorPicker from './ColorPicker.tsx';

const PRESET_THEMES = ['violet', 'blue', 'green', 'aqua'];
const THEME_COLORS: { [key: string]: string } = {
  violet: '#6A44FF',
  blue: '#1E3AFF',
  green: '#4FFF7B',
  aqua: '#2BFFC2',
};

interface SettingsModalProps {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, user, onClose, onUpdateUser }) => {
  const [theme, setTheme] = useState(user.platformTheme);
  const [layout, setLayout] = useState(user.toolLayout);
  const [mode, setMode] = useState(user.themeMode);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerContainerRef.current && !colorPickerContainerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };
    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerOpen]);

  useEffect(() => {
    if (show) {
      setTheme(user.platformTheme);
      setLayout(user.toolLayout);
      setMode(user.themeMode);
    }
  }, [show, user]);

  if (!show) return null;

  const handleSave = () => {
    onUpdateUser({
      platformTheme: theme,
      toolLayout: layout,
      themeMode: mode,
    });
    onClose();
  };
  
  const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="text-sm font-tech text-brand-text-muted tracking-widest mb-3">{title}</h3>
        <div className="p-4 bg-brand-bg-tertiary border border-brand-border rounded-xl">
            {children}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-brand-bg-secondary p-6 sm:p-8 border border-brand-border shadow-2xl shadow-brand-lemon/10 animate-scaleIn w-full max-w-lg rounded-3xl text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-muted hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-orbitron gradient-text">Settings</h2>
          <p className="text-brand-text-muted">Personalize your lab environment.</p>
        </div>

        <div className="space-y-6">
            <Section title="APPEARANCE">
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-brand-text-dim mb-2 font-tech">THEME MODE</label>
                        <div className="flex p-1 bg-brand-bg rounded-lg border border-brand-border">
                            <button onClick={() => setMode('light')} className={`w-1/2 py-2 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${mode === 'light' ? 'bg-brand-lemon text-brand-bg shadow' : 'text-brand-text-muted hover:text-white'}`}>
                               <Sun className="w-5 h-5"/> Day
                            </button>
                             <button onClick={() => setMode('dark')} className={`w-1/2 py-2 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${mode === 'dark' ? 'bg-brand-forest text-white shadow' : 'text-brand-text-muted hover:text-white'}`}>
                               <Moon className="w-5 h-5"/> Night
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-brand-text-dim mb-2 font-tech">ACCENT COLOR</label>
                        <div ref={colorPickerContainerRef} className="relative flex justify-around items-center">
                          {PRESET_THEMES.map(color => (
                            <button key={color} onClick={() => { setTheme(color); setIsColorPickerOpen(false); }} className={`w-10 h-10 rounded-full bg-brand-${color === 'blue' ? 'royal-blue' : color} transition-all ${theme === color ? 'ring-2 ring-offset-2 ring-offset-brand-bg ring-brand-lemon' : ''}`} />
                          ))}
                          <button
                            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${!PRESET_THEMES.includes(theme) ? 'ring-2 ring-offset-2 ring-offset-brand-bg ring-brand-lemon border-transparent' : 'border-dashed border-brand-border'}`}
                            style={{ background: !PRESET_THEMES.includes(theme) ? theme : 'transparent' }}
                          >
                            <Spectrum className="w-8 h-8" style={{ display: PRESET_THEMES.includes(theme) ? 'block' : 'none' }}/>
                          </button>
                          {isColorPickerOpen && (
                            <div className="absolute top-full mt-3 right-0 z-20">
                                <ColorPicker
                                    color={THEME_COLORS[theme] || theme}
                                    onChange={setTheme}
                                />
                            </div>
                          )}
                        </div>
                      </div>
                </div>
            </Section>
             <Section title="LAYOUT">
                <div>
                    <label className="block text-xs font-medium text-brand-text-dim mb-2 font-tech">TOOL DISPLAY</label>
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setLayout('grid')} className={`flex items-center justify-center gap-2 p-3 border-2 transition-all rounded-lg ${layout === 'grid' ? 'border-brand-lemon bg-brand-lemon/10 text-white' : 'border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-lemon/50'}`}>
                            <Grid className="w-5 h-5" /> Grid
                        </button>
                         <button onClick={() => setLayout('list')} className={`flex items-center justify-center gap-2 p-3 border-2 transition-all rounded-lg ${layout === 'list' ? 'border-brand-lemon bg-brand-lemon/10 text-white' : 'border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-lemon/50'}`}>
                            <ClipboardList className="w-5 h-5" /> List
                        </button>
                    </div>
                  </div>
            </Section>
        </div>

        <div className="mt-8 flex gap-4">
            <button
                onClick={handleSave}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 text-brand-bg font-bold hover:shadow-lg hover:shadow-brand-lemon/30 transform hover:scale-105 transition-all duration-200 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 100%)' }}
            >
                <Save className="w-5 h-5" />
                Save Preferences
            </button>
             <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-brand-bg-tertiary text-brand-text-muted font-bold hover:bg-brand-bg border border-brand-border transition-all rounded-lg"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;