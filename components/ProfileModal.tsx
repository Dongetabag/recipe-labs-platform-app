import React, { useState, useEffect } from 'react';
// Fix: Add file extension to import to resolve module
import { UserProfile } from '../types.ts';
// Fix: Add .tsx file extension for component imports
import { X, User as UserIcon, Mail, Save, Briefcase, Tag, Shield, MapPin, Brain, Target, FileText, ClipboardList, Award, Rocket, Code, Zap, Coffee } from './icons.tsx';

interface ProfileModalProps {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

const EditableField: React.FC<{
  name: keyof UserProfile;
  label: string;
  value: string | readonly string[] | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  icon: React.ReactNode;
  as?: 'input' | 'textarea' | 'select';
  type?: string;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
  helpText?: string;
}> = ({ name, label, icon, as = 'input', helpText, ...props }) => {
    const commonClasses = "w-full bg-brand-bg-tertiary border border-brand-border py-2.5 pl-10 pr-4 text-white placeholder-brand-text-dim focus:ring-2 focus:ring-brand-lemon/50 focus:border-brand-lemon/50 transition-all font-tech rounded-lg disabled:cursor-not-allowed disabled:bg-brand-bg disabled:text-brand-text-dim";

    const renderInput = () => {
        switch(as) {
            case 'textarea':
                return <textarea name={name} {...props} className={`${commonClasses} resize-none h-24`} />;
            case 'select':
                return (
                    <select name={name} {...props} className={`${commonClasses} appearance-none`}>
                        {props.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            default:
                return <input name={name} {...props} className={commonClasses} />;
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-brand-text-muted mb-1 font-tech">{label.toUpperCase()}</label>
            <div className="relative">
                <div className="w-5 h-5 absolute left-3 top-3.5 text-brand-text-dim">{icon}</div>
                {renderInput()}
            </div>
            {helpText && <p className="mt-1.5 text-xs text-brand-text-dim">{helpText}</p>}
        </div>
    );
};

const ProfileModal: React.FC<ProfileModalProps> = ({ show, user, onClose, onUpdateUser }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  useEffect(() => {
    if (show) {
      setFormData(user);
    }
  }, [user, show]);

  if (!show) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const goalsArray = typeof formData.primaryGoals === 'string'
      // @ts-ignore - It will be a string from the form input
      ? formData.primaryGoals.split(',').map(g => g.trim()).filter(Boolean)
      : formData.primaryGoals;

    onUpdateUser({ ...formData, primaryGoals: goalsArray });
    onClose();
  };
  
  const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
    <h3 className="text-lg font-semibold text-white border-b border-brand-border pb-2 mb-4 font-orbitron">{children}</h3>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-brand-bg-secondary p-6 sm:p-8 border border-brand-border shadow-2xl shadow-brand-lemon/10 animate-scaleIn w-full max-w-2xl rounded-3xl flex flex-col text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-muted hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-3xl font-bold gradient-text font-orbitron">TEAM PROFILE</h2>
          <p className="text-brand-text-muted">Manage your Recipe Labs profile</p>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 -mr-4 flex-grow" style={{maxHeight: '65vh'}}>
            <SectionTitle>Team Member Info</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField name="name" label="Your Name" value={formData.name} onChange={handleChange} icon={<UserIcon />} />
                <EditableField name="email" label="Email Address" value={formData.email} onChange={handleChange} icon={<Mail />} disabled />
                <EditableField
                    name="role"
                    label="Role"
                    value={formData.role}
                    onChange={handleChange}
                    icon={<Briefcase />}
                    as="select"
                    options={['Founder', 'Lead Developer', 'AI Engineer', 'Operations']}
                />
                <EditableField
                    name="department"
                    label="Department"
                    value={formData.department}
                    onChange={handleChange}
                    icon={<Rocket />}
                    as="select"
                    options={['Product Development', 'AI & Automation', 'Client Solutions', 'Growth & Strategy']}
                />
            </div>

            <SectionTitle>Work Context</SectionTitle>
            <p className="-mt-3 mb-4 text-sm text-brand-text-muted">Help the AI understand your work style and current focus.</p>
            <div className="space-y-4">
                <EditableField name="specialization" label="Your Specialization" value={formData.specialization} onChange={handleChange} icon={<Code />} placeholder="e.g., Full-Stack, AI/ML, n8n, ComfyUI"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableField name="primaryFocus" label="Primary Focus Area" value={formData.primaryFocus} onChange={handleChange} icon={<Target />} placeholder="e.g., Client Automation, Product Dev"/>
                    <EditableField name="workStyle" label="Work Style" value={formData.workStyle} onChange={handleChange} icon={<Coffee />} placeholder="e.g., Deep focus, Collaborative, Async"/>
                </div>
                <EditableField name="toolExpertise" label="Tool Expertise" value={formData.toolExpertise} onChange={handleChange} icon={<Zap />} placeholder="e.g., n8n, ComfyUI, Claude, React, Python"/>
                <EditableField name="currentProjects" label="Current Projects" value={formData.currentProjects} onChange={handleChange} icon={<FileText />} as="textarea" helpText="Active projects, clients, or initiatives you're working on."/>
                <EditableField name="primaryGoals" label="Primary Goals" value={Array.isArray(formData.primaryGoals) ? formData.primaryGoals.join(', ') : ''} onChange={handleChange} icon={<ClipboardList />} helpText="What you want to achieve with this platform. Separate with commas."/>
                <EditableField name="weeklyPriority" label="This Week's Priority" value={formData.weeklyPriority} onChange={handleChange} icon={<Award />} placeholder="e.g., Finish client dashboard, Deploy n8n workflow"/>
            </div>
        </div>

        <div className="mt-8 flex gap-4 flex-shrink-0">
            <button
                onClick={handleSave}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 text-brand-bg font-bold hover:shadow-lg hover:shadow-brand-lemon/30 transform hover:scale-105 transition-all duration-200 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 100%)' }}
            >
                <Save className="w-5 h-5" />
                Save & Retrain AI
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

export default ProfileModal;
