import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  HeartPulse, 
  FileText, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Send, 
  Activity, 
  BookOpen, 
  Key, 
  Sparkles, 
  Info, 
  FileUp, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  RefreshCw, 
  Database,
  ArrowRight,
  Mail
} from 'lucide-react';
import { CLINICAL_SAMPLES, JARGON_DICTIONARY, type HealthDocument } from './services/clinicalSamples';
import { GeminiService, type HealthIndicator, type PodcastTurn, getFallbackIndicators } from './services/GeminiService';

export default function App() {
  // Mobile responsive layout view tab
  const [mobileTab, setMobileTab] = useState<'sources' | 'analytics' | 'chat'>('analytics');

  // Settings & Configuration States
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('softingypulse_api_key') || '');
  const [tempKey, setTempKey] = useState<string>(apiKey);
  const [modelName, setModelName] = useState<string>('gemini-flash-latest');
  const [isKeyValidating, setIsKeyValidating] = useState<boolean>(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Source / Document States
  const [documents, setDocuments] = useState<HealthDocument[]>(CLINICAL_SAMPLES);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    ['sample-cbc-metabolic', 'sample-cardio-consult', 'sample-endocrine-thyroid']
  );
  const [activeDocId, setActiveDocId] = useState<string | null>(null); // null = Dashboard, string = active document ID
  
  // Custom Doc Form & Guide States
  const [isAddingDoc, setIsAddingDoc] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newType, setNewType] = useState<'blood_report' | 'doctor_note' | 'general'>('blood_report');

  // Analytics & Insights States
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [isIndicatorsLoading, setIsIndicatorsLoading] = useState<boolean>(false);
  
  // Audio Podcast States
  const [podcastBrief, setPodcastBrief] = useState<PodcastTurn[]>([]);
  const [isPodcastLoading, setIsPodcastLoading] = useState<boolean>(false);
  const [podcastPlaying, setPodcastPlaying] = useState<boolean>(false);
  const [podcastCurrentIndex, setPodcastCurrentIndex] = useState<number>(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Chat States
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>('');

  // Refs for auto-scroll and audio management
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices.filter(v => v.lang.startsWith('en')));
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Filter documents currently checked as sources
  const activeSources = useMemo(() => {
    return documents.filter(doc => selectedDocIds.includes(doc.id));
  }, [documents, selectedDocIds]);

  // Handle document analysis: generates both metrics and podcast script
  const triggerAnalysis = async (customSources?: HealthDocument[]) => {
    const sourcesToAnalyze = customSources || activeSources;
    if (sourcesToAnalyze.length === 0) {
      setIndicators([]);
      setPodcastBrief([]);
      return;
    }

    setIsIndicatorsLoading(true);
    setIsPodcastLoading(true);

    try {
      // 1. Extract health indicators (blood counts, hormones, etc.)
      const healthIndicators = await GeminiService.extractHealthIndicators(apiKey, modelName, sourcesToAnalyze);
      setIndicators(healthIndicators);
    } catch (err) {
      console.error('Error fetching indicators:', err);
      // Fallback
      setIndicators(getFallbackIndicators(sourcesToAnalyze));
    } finally {
      setIsIndicatorsLoading(false);
    }

    try {
      // 2. Generate/fetch podcast dialog
      const briefing = await GeminiService.generatePodcastBrief(apiKey, modelName, sourcesToAnalyze);
      setPodcastBrief(briefing);
    } catch (err) {
      console.error('Error fetching briefing:', err);
      // Fallback
      setPodcastBrief([]);
    } finally {
      setIsPodcastLoading(false);
    }
  };

  // Re-run analysis when sources or API parameters change
  useEffect(() => {
    triggerAnalysis();
    // Stop podcast if sources change
    handleStopPodcast();
  }, [selectedDocIds, apiKey, modelName]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  // Validate API key and save it
  const handleValidateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKey.trim()) {
      setApiKey('');
      localStorage.removeItem('softingypulse_api_key');
      setKeyFeedback({ type: 'error', message: 'API Key cleared.' });
      return;
    }

    setIsKeyValidating(true);
    setKeyFeedback({ type: null, message: '' });

    const isValid = await GeminiService.validateApiKey(tempKey);
    if (isValid) {
      setApiKey(tempKey);
      localStorage.setItem('softingypulse_api_key', tempKey);
      setKeyFeedback({ type: 'success', message: 'Gemini API Key validated and saved!' });
    } else {
      setKeyFeedback({ type: 'error', message: 'Invalid API Key. Please verify and try again.' });
    }
    setIsKeyValidating(false);
  };

  // Toggle source document inclusion in AI context
  const handleToggleSource = (id: string) => {
    setSelectedDocIds(prev => {
      if (prev.includes(id)) {
        // Don't allow deselecting everything if it leaves context empty
        if (prev.length === 1) return prev;
        return prev.filter(dId => dId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Delete an uploaded source
  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(prev => prev.filter(d => d.id !== id));
    setSelectedDocIds(prev => prev.filter(dId => dId !== id));
    if (activeDocId === id) {
      setActiveDocId(null);
    }
  };

  // Add custom user source (txt paste or file)
  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDoc: HealthDocument = {
      id: `user-doc-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      content: newContent.trim(),
      addedAt: new Date().toISOString()
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    setSelectedDocIds(prev => [...prev, newDoc.id]);
    setActiveDocId(newDoc.id); // View the newly added source immediately

    // Reset form
    setNewTitle('');
    setNewContent('');
    setIsAddingDoc(false);
  };

  // Handle uploading raw text file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setNewTitle(file.name.replace(/\.[^/.]+$/, "")); // Strip extension for title
      setNewContent(text);
      // Auto-detect type based on extension or keywords
      if (file.name.toLowerCase().includes('blood') || file.name.toLowerCase().includes('lab')) {
        setNewType('blood_report');
      } else {
        setNewType('doctor_note');
      }
    };
    reader.readAsText(file);
  };

  // Chat engine call
  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    if (!apiKey) {
      setChatError('Please enter and validate your Gemini API Key in the sidebar to chat with documents.');
      return;
    }

    setChatError('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: textToSend }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const reply = await GeminiService.generateChatResponse(
        apiKey,
        modelName,
        activeSources,
        chatHistory,
        textToSend
      );
      setChatHistory(prev => [...prev, { role: 'model' as const, content: reply }]);
    } catch (err: any) {
      setChatError(err.message || 'Failed to generate response. Please check API settings.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Send a preset prompt query helper
  const handlePresetClick = (promptText: string) => {
    handleSendMessage(undefined, promptText);
  };

  // Play Podcast speech synthesis pipeline
  const handlePlayPodcast = () => {
    if (!synthRef.current || podcastBrief.length === 0) return;

    if (podcastPlaying) {
      synthRef.current.pause();
      setPodcastPlaying(false);
      return;
    }

    if (synthRef.current.paused) {
      synthRef.current.resume();
      setPodcastPlaying(true);
      return;
    }

    setPodcastPlaying(true);
    speakTurn(podcastCurrentIndex);
  };

  const speakTurn = (index: number) => {
    if (!synthRef.current || index >= podcastBrief.length) {
      handleStopPodcast();
      return;
    }

    setPodcastCurrentIndex(index);
    const turn = podcastBrief[index];
    
    // Cancel any active speak
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(turn.text);
    utteranceRef.current = utterance;

    // Pick voices: Sarah gets a female voice, Alex gets a male voice
    const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')) || voices[0];
    const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('hazel')) || voices[1] || voices[0];

    if (turn.speaker === 'Dr. Sarah') {
      utterance.voice = femaleVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.05;
    } else {
      utterance.voice = maleVoice;
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
    }

    utterance.onend = () => {
      if (podcastPlaying) {
        speakTurn(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      handleStopPodcast();
    };

    synthRef.current.speak(utterance);
  };

  const handleStopPodcast = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setPodcastPlaying(false);
    setPodcastCurrentIndex(0);
  };

  // UI Jargon parser that returns markup
  const renderHighlightedText = (text: string) => {
    const terms = Object.keys(JARGON_DICTIONARY);
    terms.sort((a, b) => b.length - a.length); // match longest phrases first
    
    if (terms.length === 0) return <span>{text}</span>;
    
    const escapedTerms = terms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');
    
    const parts = text.split(regex);
    if (parts.length === 1) return <span>{text}</span>;
    
    return (
      <>
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          const matchingKey = terms.find(t => t.toLowerCase() === lowerPart);
          if (matchingKey) {
            const definition = JARGON_DICTIONARY[matchingKey];
            return (
              <span key={i} className="jargon-term">
                {part}
                <span className="jargon-tooltip">{definition}</span>
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Convert status label to correct CSS class name
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'status-normal';
      case 'borderline': return 'status-borderline';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-normal';
    }
  };

  return (
    <div className="app-container">
      {/* ===== HEALTH-THEMED ANIMATED BACKGROUND ===== */}
      <div className="health-bg" aria-hidden="true">
        {/* ECG / Heartbeat pulse line */}
        <svg className="ecg-line" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <polyline className="ecg-path" points="0,60 80,60 100,60 115,10 125,100 135,60 160,60 175,60 195,10 205,100 215,60 240,60 260,60 280,60 295,10 305,100 315,60 340,60 360,60 380,60 395,10 405,100 415,60 440,60 460,60 480,60 495,10 505,100 515,60 540,60 560,60 580,60 595,10 605,100 615,60 640,60 660,60 680,60 695,10 705,100 715,60 740,60 760,60 780,60 795,10 805,100 815,60 840,60 860,60 880,60 895,10 905,100 915,60 940,60 960,60 980,60 995,10 1005,100 1015,60 1040,60 1060,60 1080,60 1095,10 1105,100 1115,60 1140,60 1200,60" />
        </svg>
        {/* Floating health orbs */}
        <div className="health-orb orb-1" />
        <div className="health-orb orb-2" />
        <div className="health-orb orb-3" />
        <div className="health-orb orb-4" />
        {/* Pulse rings */}
        <div className="pulse-ring ring-1" />
        <div className="pulse-ring ring-2" />
        <div className="pulse-ring ring-3" />
        {/* DNA helix dots grid */}
        <div className="dna-grid">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`dna-dot dna-dot-${(i % 5) + 1}`} />
          ))}
        </div>
        {/* Cross / plus medical icons floating */}
        <div className="med-cross cross-1">✚</div>
        <div className="med-cross cross-2">✚</div>
        <div className="med-cross cross-3">✚</div>
      </div>
      {/* LEFT SIDEBAR: Source & Key Management */}
      <aside className={`sidebar glass-panel ${mobileTab === 'sources' ? 'active-mobile' : 'hidden-mobile'}`}>
        <div className="app-header">
          <div className="brand">
            <HeartPulse className="brand-icon" />
            <h1 className="brand-title">SoftingyPulse</h1>
            <span className="brand-tag">LM</span>
          </div>
        </div>

        {/* API Credentials Card */}
        <section className="settings-section">
          <form onSubmit={handleValidateKey}>
            <div className="input-label" style={{ marginBottom: '6px' }}>
              <span>Gemini API Key</span>
              <Key size={12} style={{ opacity: 0.6 }} />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                value={tempKey} 
                onChange={(e) => setTempKey(e.target.value)}
                className="text-input"
              />
              <button 
                type="submit" 
                disabled={isKeyValidating}
                className="send-btn"
                style={{ flexShrink: 0 }}
                title="Save & Validate"
              >
                {isKeyValidating ? <RefreshCw className="spinner" size={16} /> : <CheckCircle2 size={16} />}
              </button>
            </div>
          </form>

          {keyFeedback.message && (
            <div style={{ 
              fontSize: '0.72rem', 
              color: keyFeedback.type === 'success' ? 'var(--status-normal)' : 'var(--status-critical)',
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Info size={12} />
              <span>{keyFeedback.message}</span>
            </div>
          )}

          <div>
            <div className="input-label" style={{ marginBottom: '6px' }}>
              <span>Intelligence Engine</span>
              <Sparkles size={12} style={{ opacity: 0.6 }} />
            </div>
            <select 
              value={modelName} 
              onChange={(e) => setModelName(e.target.value)}
              className="select-input"
            >
              <option value="gemini-flash-latest">⚡ Gemini Flash Latest (Default)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Clinical)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
        </section>

        {/* Sources Selection List */}
        <div style={{ padding: '16px 16px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="input-label">Sources ({activeSources.length})</span>
          <button 
            onClick={() => setIsAddingDoc(!isAddingDoc)}
            className="source-action-btn"
            style={{ color: 'var(--primary)' }}
            title="Add Document Source"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="sources-container">
          {documents.map(doc => {
            const isActiveContext = selectedDocIds.includes(doc.id);
            return (
              <div 
                key={doc.id}
                onClick={() => handleToggleSource(doc.id)}
                className={`source-item glass-card ${isActiveContext ? 'active' : ''}`}
              >
                <div className="source-item-meta">
                  <input 
                    type="checkbox" 
                    checked={isActiveContext}
                    onChange={() => {}} // Controlled by outer div click
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <div className="source-item-icon">
                    {doc.type === 'blood_report' ? <Database size={16} /> : <FileText size={16} />}
                  </div>
                  <div>
                    <div className="source-item-title" title={doc.title}>{doc.title}</div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px', alignItems: 'center' }}>
                      <span className="source-badge">{doc.type === 'blood_report' ? 'Report' : 'ClinNote'}</span>
                      {doc.isSample && <span className="source-badge" style={{ borderColor: 'rgba(99,102,241,0.2)', color: 'var(--secondary)' }}>Sample</span>}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocId(activeDocId === doc.id ? null : doc.id);
                    }}
                    className="source-action-btn"
                    title="Read document text"
                    style={{ color: activeDocId === doc.id ? 'var(--primary)' : '#64748b' }}
                  >
                    <BookOpen size={14} />
                  </button>
                  {!doc.isSample && (
                    <button 
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="source-action-btn"
                      title="Remove source"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button onClick={() => setIsAddingDoc(true)} className="add-source-button">
            <Plus size={16} /> Add Health Document
          </button>
          <div style={{ marginTop: '20px', marginBottom: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
            GeeksforGreek <span style={{ color: 'var(--primary)', margin: '0 4px' }}>X</span> Google <span style={{ color: 'var(--primary)', margin: '0 4px' }}>X</span> Softingy
          </div>
          <button 
            onClick={() => setIsGuideOpen(true)} 
            className="source-action-btn"
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.2)', padding: '10px', color: 'var(--primary)', borderRadius: '8px', transition: 'all 0.2s ease' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(20, 184, 166, 0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(20, 184, 166, 0.05)'; }}
          >
            <Info size={16} style={{ marginRight: '8px' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>App Guide</span>
          </button>
        </div>

        {/* Upload button only — dialog is now a modal overlay outside sidebar */}
      </aside>

      {/* CENTER WORKSPACE: Dashboard Bento Grid OR Raw Source Reader */}
      <main className={`main-content ${mobileTab === 'analytics' ? 'active-mobile' : 'hidden-mobile'}`}>
        {activeDocId === null ? (
          /* VIEW A: CLINICAL METRICS & SUMMARY BENTO GRID */
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="dashboard-title-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity className="brand-icon" style={{ color: 'var(--primary)' }} />
                <h2 className="dashboard-title">Workspace Bento Analytics</h2>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => triggerAnalysis()} 
                  className="preset-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={12} /> Sync Insights
                </button>
              </div>
            </div>

            <div className="bento-grid">
              {/* Podcast Generator Bento Section */}
              <div className="bento-card glass-card">
                <span className="card-label">
                  <Users size={14} style={{ color: 'var(--secondary)' }} /> Interactive Podcast Briefing
                </span>
                
                {isPodcastLoading ? (
                  <div className="loader-container" style={{ flex: 1 }}>
                    <div className="spinner"></div>
                    <span style={{ fontSize: '0.8rem' }}>Drafting Medical Script...</span>
                  </div>
                ) : podcastBrief.length > 0 ? (
                  <div className="podcast-container">
                    <svg className="waveform-svg" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="5" y="2" width="2" height="16" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="12" y="4" width="2" height="12" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="19" y="1" width="2" height="18" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="26" y="5" width="2" height="10" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="33" y="3" width="2" height="14" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="40" y="6" width="2" height="8" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="47" y="2" width="2" height="16" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="54" y="4" width="2" height="12" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="61" y="1" width="2" height="18" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="68" y="5" width="2" height="10" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="75" y="3" width="2" height="14" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="82" y="6" width="2" height="8" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="89" y="3" width="2" height="14" rx="1" />
                      <rect className={`waveform-bar ${podcastPlaying ? 'active' : ''}`} x="96" y="5" width="2" height="10" rx="1" />
                    </svg>

                    <div className="audio-controls">
                      <button 
                        onClick={handlePlayPodcast} 
                        className={`audio-btn ${podcastPlaying ? 'playing' : ''}`}
                        title={podcastPlaying ? 'Pause Audio' : 'Play Briefing'}
                      >
                        {podcastPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                      </button>
                      {podcastPlaying && (
                        <button 
                          onClick={handleStopPodcast} 
                          className="preset-btn"
                          style={{ padding: '8px 12px', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--status-critical)' }}
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="podcast-speaker-badge speaker-sarah">
                      {podcastBrief[podcastCurrentIndex]?.speaker || 'Dr. Sarah'}
                    </div>

                    <div className="speech-subtitle">
                      "{podcastBrief[podcastCurrentIndex]?.text || 'Click play to hear a clinical overview of the active medical files.'}"
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <Info className="empty-icon" size={24} />
                    <span style={{ fontSize: '0.8rem' }}>Select active sources in the sidebar to generate a podcast brief.</span>
                  </div>
                )}
              </div>

              {/* Quick Health Summary Bento Section */}
              <div className="bento-card glass-card">
                <span className="card-label">
                  <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} /> Clinical Summary
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, fontSize: '0.82rem', lineHeight: '1.5' }}>
                  <p style={{ color: '#94a3b8' }}>
                    Based on the {activeSources.length} selected medical records, the following items require attention:
                  </p>
                  
                  {activeSources.map(doc => {
                    if (doc.id === 'sample-cbc-metabolic') {
                      return (
                        <div key={doc.id} style={{ borderLeft: '2px solid var(--status-critical)', paddingLeft: '10px', margin: '4px 0' }}>
                          <strong style={{ color: '#fff' }}>Hyperlipidemia:</strong> Bad cholesterol (LDL) is significantly elevated at 165 mg/dL.
                        </div>
                      );
                    }
                    if (doc.id === 'sample-endocrine-thyroid') {
                      return (
                        <div key={doc.id} style={{ borderLeft: '2px solid var(--status-warning)', paddingLeft: '10px', margin: '4px 0' }}>
                          <strong style={{ color: '#fff' }}>Hypothyroidism:</strong> TSH hormone is elevated at 5.25, indicating underactive thyroid functioning.
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  <div style={{ marginTop: 'auto', padding: '10px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <strong style={{ color: 'var(--secondary)' }}>Advice:</strong> Dr. Vance suggests dietary adjustments (DASH diet) and dosage titration of lipid-lowering medication (Atorvastatin 40mg). Levothyroxine started for thyroid regulation.
                  </div>
                </div>
              </div>

              {/* Lab Biomarkers & Gauges Bento Card */}
              <div className="bento-card glass-card full-width">
                <span className="card-label">
                  <Database size={14} style={{ color: 'var(--primary)' }} /> Biological Indicators & Lab Assays ({indicators.length})
                </span>

                {isIndicatorsLoading ? (
                  <div className="loader-container">
                    <div className="spinner"></div>
                    <span style={{ fontSize: '0.8rem' }}>Mapping lab panels...</span>
                  </div>
                ) : indicators.length > 0 ? (
                  <div className="indicators-list">
                    {indicators.map((ind, i) => (
                      <div key={i} className="indicator-row">
                        <div className="indicator-meta">
                          <span className="indicator-name">{ind.name}</span>
                          <span className="indicator-desc">{ind.explanation}</span>
                        </div>
                        <div className="indicator-value-container">
                          <div className="indicator-value">
                            {ind.value} <span className="indicator-unit">{ind.unit}</span>
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', margin: '2px 0' }}>
                            Ref: {ind.normalRange}
                          </div>
                          <span className={`indicator-status-badge ${getStatusClass(ind.status)}`}>
                            {ind.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Info className="empty-icon" />
                    <span>Select sources to parse biological lab values.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW B: DETAILED DOCUMENT / SOURCE READER */
          <div className="source-viewer-container glass-panel">
            {(() => {
              const currentDoc = documents.find(d => d.id === activeDocId);
              if (!currentDoc) return null;
              return (
                <>
                  <div className="source-viewer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText className="brand-icon" style={{ color: 'var(--primary)' }} />
                      <div>
                        <h2 className="dashboard-title">{currentDoc.title}</h2>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          Type: {currentDoc.type === 'blood_report' ? 'Laboratory Panel' : 'Clinical Chart Note'} | Compiled: {new Date(currentDoc.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveDocId(null)}
                      className="preset-btn"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Close Viewer <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="source-viewer-body">
                    {renderHighlightedText(currentDoc.content)}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR: Chat Engine workspace */}
      <section className={`chat-panel glass-panel ${mobileTab === 'chat' ? 'active-mobile' : 'hidden-mobile'}`}>
        <div className="chat-header">
          <HeartPulse size={18} style={{ color: 'var(--primary)' }} />
          <h2 className="dashboard-title" style={{ fontSize: '1rem' }}>Clinical Conversational AI</h2>
        </div>

        {/* Chat Conversation Stream */}
        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <HeartPulse className="brand-icon" style={{ width: '48px', height: '48px', opacity: 0.2 }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>SoftingyPulse AI</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', padding: '0 20px', lineHeight: '1.4' }}>
                Ask questions about your health documents. SoftingyPulse will only answer from the active sources — never from outside knowledge.
              </p>
            </div>
          ) : (
            chatHistory.map((chat, idx) => (
              <div key={idx} className={`chat-message ${chat.role}`}>
                {/* Process citations in text for display */}
                <div className="markdown-body" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({href, children}) => {
                        if (href && href.startsWith('#source-')) {
                          const srcIndex = parseInt(href.replace('#source-', '')) - 1;
                          const citedDoc = activeSources[srcIndex];
                          return (
                            <span 
                              className="citation-badge"
                              title={citedDoc ? citedDoc.title : 'Active Source'}
                              onClick={() => {
                                if (citedDoc) {
                                  setActiveDocId(citedDoc.id);
                                }
                              }}
                            >
                              {children}
                            </span>
                          );
                        }
                        return <a href={href!} target="_blank" rel="noopener noreferrer">{children}</a>;
                      },
                      p: ({children}) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                      ul: ({children}) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ul>,
                      ol: ({children}) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ol>,
                      li: ({children}) => <li style={{ margin: '4px 0' }}>{children}</li>,
                      strong: ({children}) => <strong style={{ fontWeight: 600, color: 'var(--primary)' }}>{children}</strong>,
                    }}
                  >
                    {chat.content.replace(/\[Source (\d+)\]/g, '[Source $1](#source-$1)')}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}

          {isChatLoading && (
            <div className="chat-message model" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
              <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Consulting clinical documents...</span>
            </div>
          )}

          {chatError && (
            <div style={{ 
              padding: '10px 12px', 
              background: 'rgba(244,63,94,0.1)', 
              border: '1px solid rgba(244,63,94,0.25)', 
              borderRadius: '8px', 
              color: 'var(--status-critical)', 
              fontSize: '0.75rem',
              lineHeight: '1.4'
            }}>
              {chatError}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Dynamic Chat Controls (Prompt Helper & Input) */}
        <div className="chat-input-container">
          <div className="preset-prompts">
            <button 
              onClick={() => handlePresetClick("Explain all abnormal lab values in simple layman terms.")}
              className="preset-btn"
            >
              Explain abnormals
            </button>
            <button 
              onClick={() => handlePresetClick("What dietary and lifestyle adjustments are recommended based on these reports?")}
              className="preset-btn"
            >
              Diet suggestions
            </button>
            <button 
              onClick={() => handlePresetClick("What list of questions should I ask my doctor during my next follow-up consult?")}
              className="preset-btn"
            >
              Doctor questions
            </button>
          </div>

          <form onSubmit={handleSendMessage} className="chat-form">
            <input 
              type="text" 
              placeholder={apiKey ? "Ask a health query..." : "Set API Key in sidebar first..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="chat-input"
              disabled={!apiKey}
            />
            <button 
              type="submit" 
              disabled={!apiKey || !chatInput.trim() || isChatLoading}
              className="send-btn"
            >
              <Send size={16} />
            </button>
          </form>

          <p className="disclaimer-text">
            SoftingyPulse is for educational purposes. Consult a physician for actual medical care.
          </p>
        </div>
      </section>

      {/* ===== ADD HEALTH DOCUMENT MODAL — rendered via portal to document.body ===== */}
      {isAddingDoc && createPortal(
        <div
          className="doc-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddingDoc(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Add Health Document"
        >
          <div className="doc-modal glass-panel">
            {/* Modal Header */}
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileUp size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: '#f8fafc' }}>New Health Document</span>
              </div>
              <button
                onClick={() => setIsAddingDoc(false)}
                className="source-action-btn"
                style={{ fontSize: '1rem', width: '32px', height: '32px', borderRadius: '8px' }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddCustomDoc} className="doc-modal-body">
              {/* File Upload Drop Zone */}
              <div>
                <label className="input-label" style={{ marginBottom: '6px' }}>Upload File <span style={{ opacity: 0.5 }}>(optional, .txt / .md)</span></label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="text-input doc-dropzone"
                >
                  <FileUp size={22} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Click to select a text file</span>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>.txt or .md files supported</span>
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="input-label" style={{ marginBottom: '6px' }}>Document Title <span style={{ color: 'var(--status-critical)' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Lipids Panel 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-input"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="input-label" style={{ marginBottom: '6px' }}>Document Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="select-input"
                >
                  <option value="blood_report">🩸 Lab / Blood Report</option>
                  <option value="doctor_note">🩺 Doctor Notes / Consultations</option>
                  <option value="general">📋 General Medical Info</option>
                </select>
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <label className="input-label" style={{ marginBottom: '6px' }}>Paste Content <span style={{ color: 'var(--status-critical)' }}>*</span></label>
                <textarea
                  placeholder="Paste clinical report data here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="text-input"
                  rows={6}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, minHeight: '120px' }}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="add-source-button"
                style={{ borderStyle: 'solid', background: 'var(--primary)', color: '#0b0f19', fontWeight: 700, fontSize: '0.9rem', padding: '12px' }}
              >
                Assemble Into Workspace
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ===== APP GUIDE MODAL ===== */}
      {isGuideOpen && createPortal(
        <div
          className="doc-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setIsGuideOpen(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="doc-modal glass-panel" style={{ maxWidth: '640px' }}>
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: '#f8fafc' }}>SoftingyPulse Guide</span>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="source-action-btn"
                style={{ fontSize: '1rem', width: '32px', height: '32px', borderRadius: '8px' }}
                aria-label="Close"
              >✕</button>
            </div>
            <div className="doc-modal-body" style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1.1rem' }}>Welcome to SoftingyPulse</h3>
              <p style={{ marginBottom: '16px' }}>SoftingyPulse is a clinical workspace powered by the Gemini API, designed specifically to analyze and converse about healthcare documents like blood reports and doctor notes.</p>
              
              <h4 style={{ color: '#f8fafc', marginBottom: '8px' }}>1. Set Your API Key 🔑</h4>
              <p style={{ marginBottom: '16px' }}>Click the Settings gear/key icon in the sidebar and paste your Google Gemini API key. Your key is stored securely in your browser's local storage and is never sent anywhere except directly to Google.</p>

              <h4 style={{ color: '#f8fafc', marginBottom: '8px' }}>2. Manage Health Documents 📄</h4>
              <p style={{ marginBottom: '16px' }}>Click <strong>+ Add Health Document</strong> to paste text from your medical reports or upload a .txt/.md file. You can select multiple documents as active context by ticking the checkboxes next to them in the sidebar.</p>

              <h4 style={{ color: '#f8fafc', marginBottom: '8px' }}>3. Sync Insights & Podcast 🎧</h4>
              <p style={{ marginBottom: '16px' }}>In the <strong>Workspace Bento Analytics</strong> section, click <strong>Sync Insights</strong>. The Gemini AI will extract a clinical summary, parse critical lab values into a clean UI widget, and generate an interactive Audio Podcast briefing based on the selected records!</p>

              <h4 style={{ color: '#f8fafc', marginBottom: '8px' }}>4. Clinical Conversational AI 💬</h4>
              <p style={{ marginBottom: '16px' }}>Ask questions in the right panel (or the Chat tab on mobile). The AI is strictly <strong>agentic</strong> and grounded: it will <em>only</em> draw information from the active documents you have selected. It will cite its sources and refuse to answer if the information is not present in the documents, preventing dangerous medical hallucinations.</p>
              
              <h4 style={{ color: '#f8fafc', marginBottom: '8px' }}>Help & Support 🤝</h4>
              <p style={{ marginBottom: '16px' }}>Need help or want to report an issue? Feel free to reach out!</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                <a href="mailto:info@softingy.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                  <Mail size={16} /> info@softingy.com (or muizz7041@gmail.com)
                </a>
                <a href="https://instagram.com/abdulmuizzrajput" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                  <span style={{ fontSize: '16px' }}>📸</span> @abdulmuizzrajput
                </a>
                <a href="https://github.com/abdulmuizzrajput" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                  <span style={{ fontSize: '16px' }}>🐙</span> abdulmuizzrajput
                </a>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', margin: 0 }}><strong>Disclaimer:</strong> SoftingyPulse is an educational tool built for the GeeksforGeeks x Google Gemini hackathon. It is not a substitute for professional medical advice.</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Mobile / Tablet Responsive Navigation Bar */}
      <nav className="mobile-nav-bar">
        <button 
          onClick={() => setMobileTab('sources')} 
          className={`mobile-nav-btn ${mobileTab === 'sources' ? 'active' : ''}`}
        >
          <Database size={18} />
          <span>Sources</span>
        </button>
        <button 
          onClick={() => setMobileTab('analytics')} 
          className={`mobile-nav-btn ${mobileTab === 'analytics' ? 'active' : ''}`}
        >
          <Activity size={18} />
          <span>Workspace</span>
        </button>
        <button 
          onClick={() => setMobileTab('chat')} 
          className={`mobile-nav-btn ${mobileTab === 'chat' ? 'active' : ''}`}
        >
          <HeartPulse size={18} />
          <span>Chat AI</span>
        </button>
      </nav>
    </div>
  );
}
