import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Sliders, 
  Clock, 
  FileText, 
  MapPin, 
  Zap,
  RotateCcw,
  ExternalLink,
  Layers,
  HelpCircle,
  Key,
  CheckCircle2,
  AlertTriangle,
  Settings,
  BrainCircuit,
  Wrench,
  DollarSign,
  Calendar,
  Building2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ApiService } from '../../services/api';
import { CopilotMessage } from '../../types';

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssetId?: string;
}

interface AgentPersona {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  color: string;
  badge: string;
  description: string;
  prompts: string[];
}

const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'general',
    name: 'Executive Decision Intelligence',
    shortName: 'Executive',
    icon: Building2,
    color: 'from-blue-600 to-indigo-600',
    badge: '🏛️ Executive',
    description: 'Citywide infrastructure synthesis, strategic roadmap & priority balance',
    prompts: [
      'Which assets need urgent attention in Coimbatore?',
      'What is our recommended 3-phase execution roadmap?',
      'How is our ₹1.50 Cr capital budget allocated?'
    ]
  },
  {
    id: 'risk',
    name: 'Risk & Safety Analyst',
    shortName: 'Risk Analyst',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-600',
    badge: '⚠️ Risk & Safety',
    description: '6-factor MCDA risk modeling, traffic load vulnerability & hazard mitigation',
    prompts: [
      'Why is the #1 priority corridor high risk?',
      'Explain 6-factor MCDA formula & weights',
      'What are the primary structural risk drivers?'
    ]
  },
  {
    id: 'budget',
    name: 'Capital Budget Optimizer',
    shortName: 'Budget',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
    badge: '💰 Budget',
    description: 'Knapsack 0/1 optimization, deficit bridging & 3.8x preventative ROI',
    prompts: [
      'How does Knapsack optimize ₹1.50 Cr envelope?',
      'What is our critical unfunded budget gap?',
      'Which assets were deferred and why?'
    ]
  },
  {
    id: 'inspection',
    name: 'Damage & Vision Inspector',
    shortName: 'Inspection',
    icon: Wrench,
    color: 'from-purple-500 to-violet-600',
    badge: '🔬 Inspection',
    description: 'Pavement distress forensics, crack telemetry & engineering interventions',
    prompts: [
      'What damage was detected in latest inspection?',
      'Explain alligator cracking vs structural fatigue',
      'What engineering fix is recommended?'
    ]
  },
  {
    id: 'simulation',
    name: 'Deterioration & Delay Forecaster',
    shortName: 'Forecaster',
    icon: Clock,
    color: 'from-rose-500 to-pink-600',
    badge: '⏳ Forecaster',
    description: 'Non-linear decay physics, +52% delay penalty & monsoon escalation',
    prompts: [
      'What happens if we delay repairs by 6 months?',
      'Show cost-of-delay penalty curve',
      'Why does monsoon accelerate subgrade failure?'
    ]
  },
  {
    id: 'policy',
    name: 'Ward & Policy Coordinator',
    shortName: 'Ward Officer',
    icon: ShieldCheck,
    color: 'from-cyan-500 to-blue-600',
    badge: '🛡️ Ward Officer',
    description: 'Ward distributions, arterial traffic bypass & citizen impact mitigation',
    prompts: [
      'Which ward has the highest road distress?',
      'How do we manage arterial traffic bypass?',
      'What is the step-by-step repair schedule?'
    ]
  }
];

export const CivicXCopilotPanel: React.FC<CopilotPanelProps> = ({
  isOpen,
  onClose,
  activeAssetId
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedAgent, setSelectedAgent] = useState<string>('general');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return localStorage.getItem('civicx_gemini_api_key') || '';
  });
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ valid: boolean; message: string } | null>(null);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'CivicX Decision Intelligence connected to Coimbatore infrastructure telemetry.',
      why: 'I can explain risk scores, evaluate delay penalties, analyze budget allocation, and provide ground-truth inspection evidence.',
      evidence: [
        { label: 'Ground Truth Telemetry', value: '78 Active Corridors', source: 'Municipal GIS Inventory' },
        { label: 'Decision Core', value: 'MCDA + Knapsack + Non-Linear Deterioration', source: 'CivicX AI Core' }
      ],
      source_model: 'Google Gemini 1.5 Flash / CivicX Core',
      model_type: 'gemini',
      agent_mode: 'general',
      suggested_prompts: [
        'Which assets need urgent attention in Coimbatore?',
        'Why is the #1 priority corridor high risk?',
        'How is our ₹1.50 Cr capital budget allocated?',
        'What happens if we delay road repairs by 6 months?'
      ]
    }
  ]);

  // Derive active context string from current route
  const getContextLabel = () => {
    const path = location.pathname;
    if (path.startsWith('/assets/')) {
      const id = path.split('/')[2];
      return `Asset Corridor #${id}`;
    }
    if (path === '/dashboard') return 'Command Center (Citywide Overview)';
    if (path === '/map') return 'GIS Risk Intelligence Map';
    if (path === '/priorities') return 'Priority Ranking Queue';
    if (path === '/budget') return 'Budget Optimizer Portfolio';
    if (path === '/simulation') return 'City Time Machine Deterioration Model';
    if (path === '/reports') return 'Decision Dossiers & Reports';
    return 'CivicX Global Telemetry';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setKeyStatus({ valid: false, message: 'Please enter a Gemini API Key.' });
      return;
    }
    setTestingKey(true);
    setKeyStatus(null);
    try {
      const res = await ApiService.testGeminiApiKey(apiKeyInput.trim());
      setKeyStatus({ valid: res.valid, message: res.message });
      if (res.valid) {
        localStorage.setItem('civicx_gemini_api_key', apiKeyInput.trim());
      }
    } catch {
      setKeyStatus({ valid: false, message: 'Network failed to validate key.' });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('civicx_gemini_api_key', apiKeyInput.trim());
    } else {
      localStorage.removeItem('civicx_gemini_api_key');
    }
    setIsSettingsOpen(false);
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    localStorage.removeItem('civicx_gemini_api_key');
    setKeyStatus(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      let assetIdToPass = activeAssetId;
      if (!assetIdToPass && location.pathname.startsWith('/assets/')) {
        assetIdToPass = location.pathname.split('/')[2];
      }

      const res = await ApiService.sendCopilotMessage(
        query, 
        {
          asset_id: assetIdToPass,
          route: location.pathname
        },
        selectedAgent,
        apiKeyInput.trim() || undefined
      );

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answer,
        why: res.why,
        evidence: res.evidence,
        actions: res.actions,
        suggested_prompts: res.suggested_prompts,
        context_asset: res.context_asset,
        source_model: res.source_model,
        model_type: res.model_type,
        agent_mode: res.agent_mode || selectedAgent
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Copilot response failed', err);
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "I couldn't complete that analysis at this moment. CivicX decision engine is standing by."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const currentPersona = AGENT_PERSONAS.find(a => a.id === selectedAgent) || AGENT_PERSONAS[0];
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Switched to ${currentPersona.name}. Ready to analyze Coimbatore municipal infrastructure.`,
        why: currentPersona.description,
        source_model: apiKeyInput.trim() ? 'Google Gemini 1.5 Flash' : 'CivicX Core Engine',
        model_type: apiKeyInput.trim() ? 'gemini' : 'deterministic',
        agent_mode: selectedAgent,
        suggested_prompts: currentPersona.prompts
      }
    ]);
  };

  const activePersonaObj = AGENT_PERSONAS.find(a => a.id === selectedAgent) || AGENT_PERSONAS[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none no-print">
        {/* Backdrop for mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-civic-dark/40 backdrop-blur-xs pointer-events-auto sm:hidden"
        />

        {/* Slide-out Copilot Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-civic-border shadow-2xl pointer-events-auto flex flex-col z-50"
        >
          {/* 1. Header */}
          <div className="p-3.5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-civic-dark border border-white/20 flex items-center justify-center shadow-inner">
                <Bot className="w-4 h-4 text-lime" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-sm tracking-tight text-white">
                    CIVICX DECISION AI
                  </h3>
                  <span className="bg-lime text-civic-dark text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded font-mono">
                    MULTI-AGENT
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-zinc-400">
                    {apiKeyInput.trim() ? 'GEMINI 1.5 FLASH CONNECTED' : 'CIVICX NEURAL CORE CONNECTED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="AI Settings & Free Gemini API Key"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono ${apiKeyInput.trim() ? 'bg-lime/20 text-lime hover:bg-lime/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              >
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">
                  {apiKeyInput.trim() ? 'Key Active' : 'Set Key'}
                </span>
              </button>
              <button
                onClick={handleClearChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                title="Close Copilot Panel"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Specialized Agent Persona Selector */}
          <div className="bg-zinc-950 p-2 border-b border-zinc-800 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase px-1 shrink-0">Agent:</span>
            {AGENT_PERSONAS.map((agent) => {
              const isSelected = selectedAgent === agent.id;
              const IconComponent = agent.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-zinc-800 text-white font-bold border border-lime/60 shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                  title={agent.description}
                >
                  <IconComponent className={`w-3 h-3 ${isSelected ? 'text-lime' : 'text-zinc-500'}`} />
                  <span>{agent.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Active Context Ribbon */}
          <div className="px-4 py-2 bg-zinc-100 border-b border-zinc-200 text-[11px] font-mono text-zinc-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-zinc-400 uppercase font-bold">Scope:</span>
              <span className="font-bold text-civic-dark truncate">{getContextLabel()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                {activePersonaObj.badge}
              </span>
            </div>
          </div>

          {/* 4. Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'user' ? (
                  /* User Bubble */
                  <div className="max-w-[85%] p-3 rounded-2xl bg-civic-dark text-white text-xs font-medium shadow-subtle">
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] text-zinc-400 font-mono block text-right mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : (
                  /* Assistant Grounded Response Card */
                  <div className="max-w-[95%] space-y-2.5">
                    <div className="p-4 rounded-2xl bg-white border border-civic-border shadow-subtle space-y-3">
                      
                      {/* Model & Agent Meta Badge */}
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2 text-[10px] font-mono">
                        <div className="flex items-center gap-1 text-zinc-600 font-bold">
                          {msg.model_type === 'gemini' ? (
                            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold border border-blue-100">
                              <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                              {msg.source_model || 'Gemini 1.5 Flash'}
                            </span>
                          ) : msg.model_type === 'guardrail' ? (
                            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                              <ShieldCheck className="w-2.5 h-2.5 text-amber-600" />
                              Domain Boundary Guard
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                              <Cpu className="w-2.5 h-2.5 text-emerald-600" />
                              {msg.source_model || 'CivicX Neural Engine'}
                            </span>
                          )}
                        </div>
                        {msg.context_asset && (
                          <span className="text-zinc-400 truncate max-w-[150px]">
                            {msg.context_asset}
                          </span>
                        )}
                      </div>

                      {/* Direct Answer */}
                      <p className="text-xs font-semibold text-civic-dark leading-relaxed">
                        {msg.text}
                      </p>

                      {/* Why Reasoning */}
                      {msg.why && (
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 leading-relaxed font-medium">
                          <strong className="text-zinc-900 block font-mono text-[10px] uppercase mb-0.5">Decision Rationale:</strong>
                          {msg.why}
                        </div>
                      )}

                      {/* Ground Truth Evidence Badges */}
                      {msg.evidence && msg.evidence.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-mono uppercase font-bold text-zinc-400 block">
                            Ground-Truth Evidence Applied:
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {msg.evidence.map((ev, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-zinc-50 border border-zinc-150 text-[11px] flex items-center justify-between">
                                <span className="text-zinc-600 font-medium">{ev.label}:</span>
                                <div className="text-right font-mono">
                                  <span className="font-bold text-zinc-900 block">{ev.value}</span>
                                  <span className="text-[8px] text-zinc-400 block">Source: {ev.source}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Action Shortcuts */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5">
                          {msg.actions.map((act, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                navigate(act.route);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1 font-mono shadow-subtle"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-lime" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggested Follow-up Prompts */}
                    {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Suggested Inquiries:</span>
                        <div className="flex flex-wrap gap-1">
                          {msg.suggested_prompts.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[10px] font-medium text-zinc-700 hover:bg-zinc-100 hover:text-civic-dark transition-all text-left shadow-2xs"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-subtle flex items-center gap-2 max-w-[85%]">
                <div className="w-4 h-4 rounded-full border-2 border-civic-dark border-t-transparent animate-spin" />
                <span className="text-xs text-zinc-600 font-mono">
                  {apiKeyInput.trim() ? 'Synthesizing with Google Gemini LLM…' : 'Consulting CivicX decision engines…'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Persona Prompt Suggestions Pill Bar */}
          <div className="px-3 py-1.5 bg-zinc-100 border-t border-zinc-200 flex items-center gap-1 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase shrink-0">Quick:</span>
            {activePersonaObj.prompts.map((p, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(p)}
                className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50 hover:text-civic-dark truncate max-w-[200px] shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* 5. Input Controls */}
          <div className="p-3.5 bg-white border-t border-civic-border space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${activePersonaObj.name}…`}
                disabled={loading}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-civic-dark focus:outline-none focus:ring-2 focus:ring-lime disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 rounded-xl bg-civic-dark text-white hover:bg-zinc-800 disabled:opacity-30 transition-all shadow-subtle"
              >
                <Send className="w-4 h-4 text-lime" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
              <span className="truncate">Grounded in 78 Coimbatore infrastructure assets</span>
              <span className="text-emerald-700 font-bold shrink-0 ml-1">Zero Hallucination Policy</span>
            </div>
          </div>

          {/* AI Settings Modal */}
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-civic-dark/70 backdrop-blur-xs flex items-center justify-center p-4 z-60"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-zinc-200 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-lime/20 flex items-center justify-center">
                        <Key className="w-4 h-4 text-civic-dark" />
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 font-display">
                        AI Model & API Key
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Google Gemini API Key (Optional)
                      </label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          setKeyStatus(null);
                        }}
                        placeholder="AIzaSy..."
                        className="w-full py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Get a 100% free API key from{' '}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-semibold"
                        >
                          Google AI Studio
                        </a>.
                      </p>
                    </div>

                    {keyStatus && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                          keyStatus.valid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {keyStatus.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="text-[11px]">{keyStatus.message}</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                      <strong className="text-zinc-900 block font-bold">Offline Resilience:</strong>
                      <p>If no key is configured, CivicX operates on its built-in deterministic MCDA and Knapsack decision intelligence engines.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 gap-2">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleTestKey}
                        disabled={testingKey || !apiKeyInput.trim()}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 disabled:opacity-40 transition-colors"
                      >
                        {testingKey ? 'Testing…' : 'Test Key'}
                      </button>
                      {apiKeyInput && (
                        <button
                          type="button"
                          onClick={handleClearApiKey}
                          className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      className="px-4 py-1.5 rounded-lg bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 shadow-subtle"
                    >
                      Save & Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
