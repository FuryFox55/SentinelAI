'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Send,
  Mic,
  Grid,
  Shield,
  Settings,
  ArrowRight,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Paperclip,
  X,
  AlertTriangle,
  FileImage,
  CornerDownLeft
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { authenticatedFetch } from '@/lib/supabase';
import { startSimulatedPhoneCall } from '@/lib/services/intelligence';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string | null;
  isError?: boolean;
}

const suggestedPrompts = [
  "Is this message a scam?",
  "I received a Digital Arrest call.",
  "Analyze this suspicious SMS.",
  "How do QR scams work?",
  "Explain UPI fraud.",
  "Someone is asking for an OTP."
];

// Helper to format basic markdown bullets and bold formatting offline
function formatMessageText(text: string) {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((para, pIdx) => {
    // List matching
    if (para.trim().startsWith('- ') || para.trim().startsWith('* ')) {
      const items = para.split('\n').filter(Boolean);
      return (
        <ul key={pIdx} className="list-disc pl-5 my-2 space-y-1.5 text-xs text-on-surface-variant">
          {items.map((item, iIdx) => {
            const cleanItem = item.replace(/^[-*]\s+/, '');
            return <li key={iIdx}>{renderTextWithBold(cleanItem)}</li>;
          })}
        </ul>
      );
    }

    // Default paragraph
    return (
      <p key={pIdx} className="mb-2 leading-relaxed text-xs text-on-surface-variant">
        {para.split('\n').map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {renderTextWithBold(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

function renderTextWithBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AssistantPage() {
  const router = useRouter();
  const { user, scanLogs } = useAppStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [liveProtectionMode, setLiveProtectionMode] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; data: string }>>([]);
  const [processingStage, setProcessingStage] = useState(0);
  const [emergencyAlert, setEmergencyAlert] = useState<{ active: boolean; score: number; why: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sentinel_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    localStorage.setItem('sentinel_chat_history', JSON.stringify(newMsgs));
  };

  const initializeWelcomeMessage = () => {
    const welcome: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome! I am Sentinel AI Security Copilot, your real-time cybersecurity assistant. I orchestrate threat detection across all workspace modules, investigate phone numbers, emails, logs, and files, and calculate live Fraud Confidence indices to keep you safe.\n\nYou can upload multiple files (images, PDFs, documents, audio clips, or logs) or chat directly with me. Live Protection is active.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    saveChatHistory([welcome]);
  };

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Handle auto-resizing text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = async (text: string) => {
    const messageContent = text.trim();
    const hasFiles = attachedFiles.length > 0;
    
    if (!messageContent && !hasFiles) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageContent || "Analyze attached cybersecurity evidence logs:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = [...messages, userMsg];
    saveChatHistory(updatedMsgs);
    setInputText('');
    setTyping(true);
    setErrorMessage(null);
    setProcessingStage(1); // Receiving Input

    const stageInterval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev >= 5) return 5;
        return prev + 1;
      });
    }, 700);

    try {
      const res = await authenticatedFetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMsgs,
          files: attachedFiles,
          liveProtectionMode: liveProtectionMode
        })
      });

      clearInterval(stageInterval);

      if (!res.ok) {
        throw new Error(`Server returned code: ${res.status}`);
      }

      const responseData = await res.json();
      setAttachedFiles([]); // Clear file buffer

      if (responseData.isEmergency) {
        setEmergencyAlert({
          active: true,
          score: responseData.fraudConfidence,
          why: responseData.message
        });
      }
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: responseData.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      saveChatHistory([...updatedMsgs, assistantMsg]);

    } catch (err: any) {
      clearInterval(stageInterval);
      setErrorMessage(err.message || 'Chatbot connection error.');
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: "🚨 Connectivity Mismatch: Unable to securely stream response from the central Scam Prevention Analyzer node. Please ensure central services are nominal.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      saveChatHistory([...updatedMsgs, errorMsg]);
    } finally {
      setTyping(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('sentinel_chat_history');
    initializeWelcomeMessage();
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserIdx = [...messages].reverse().findIndex(m => m.sender === 'user');
    if (lastUserIdx !== -1) {
      const realIdx = messages.length - 1 - lastUserIdx;
      const userMsg = messages[realIdx];
      const sliced = messages.slice(0, realIdx);
      saveChatHistory(sliced);
      handleSend(userMsg.text);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        setAttachedFiles(prev => [
          ...prev,
          { name: file.name, data: base64Data }
        ]);
        showSuccessToast(`Attached: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const latestScan = scanLogs[0];

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#e0e3e5] flex flex-col pb-24 relative overflow-hidden pt-16">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-15">
        <div className="absolute top-[20%] left-[-10%] w-[320px] h-[320px] rounded-full bg-cyan-500/10 blur-[100px]"></div>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-45 bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363d]/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-cyan-400 flex items-center justify-center p-1.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 icon-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-xs leading-none block">SECURITY COPILOT</span>
            <span className="text-[7px] text-cyan-300 font-extrabold uppercase tracking-widest block mt-0.5">Sentinel AI Orchestrator</span>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[8px] font-bold text-outline uppercase tracking-wider">Live Protection</span>
            <input
              type="checkbox"
              checked={liveProtectionMode}
              onChange={(e) => setLiveProtectionMode(e.target.checked)}
              className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 w-3.5 h-3.5"
            />
          </label>
          <button
            onClick={handleClearHistory}
            className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-transparent hover:border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </header>

      {/* Toast Alert popup */}
      {toastMsg && (
        <div className="fixed top-18 right-4 left-4 z-50 p-4 bg-cyan-950/90 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs flex items-center justify-between shadow-2xl backdrop-blur-md animate-[slideDown_0.2s_ease-out_forwards]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-outline hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Chat Canvas */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 flex flex-col relative z-10 overflow-hidden">
        
        {/* Dynamic Context Banner */}
        {latestScan && (
          <div className="mb-3 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs flex justify-between items-center gap-3">
            <div className="min-w-0">
              <span className="text-[7.5px] font-bold text-cyan-300 uppercase block tracking-wider leading-none">Diagnostic Context Loaded</span>
              <span className="font-bold text-white block mt-1 truncate">{latestScan.module} - {latestScan.threatLevel} ({latestScan.score}%)</span>
            </div>
            <button
              onClick={() => {
                setInputText(`Help me analyze my recent ${latestScan.module} threat score of ${latestScan.score}%. It flagged: "${latestScan.explanation}"`);
              }}
              className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-[9px] font-bold uppercase hover:bg-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all"
            >
              Analyze
            </button>
          </div>
        )}

        {/* Message Container */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-1 min-h-[350px] hide-scrollbar pb-6 flex flex-col">
          {messages.length <= 1 && (
            <div className="py-6 flex flex-col gap-6 text-center animate-[fadeIn_0.3s_ease-out] my-auto">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mx-auto shadow-lg icon-glow">
                <Bot className="w-9 h-9 text-cyan-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-base font-black text-white uppercase tracking-tight">Scam Shield Intelligence</h1>
                <p className="text-[11px] text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                  Query the Grok-powered model regarding UPI collect request anomalies, digital arrests, fake bank slips, or verification checklists.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="space-y-3 mt-4 text-left">
                <span className="text-[9.5px] font-bold text-outline uppercase tracking-widest block px-1">Suggested Safety Queries</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="cyber-card w-full text-left p-3.5 rounded-xl border border-white/5 text-[11px] text-[#e0e3e5] hover:border-cyan-500/30 transition-all active:scale-[0.99] flex justify-between items-center gap-2 bg-[#161B22]/40"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat log maps */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] animate-[fadeIn_0.25s_ease-out_forwards] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border font-bold text-[10px] shadow-sm ${msg.sender === 'user' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : 'bg-surface-container border-white/10 text-white'}`}>
                {msg.sender === 'user' ? (user?.avatar || 'SR') : <Bot className="w-4.5 h-4.5 text-cyan-400" />}
              </div>
              
              <div className="space-y-1.5 max-w-full">
                {/* Bubble card */}
                <div className={`rounded-2xl p-3.5 text-xs leading-relaxed border shadow-md relative group ${msg.sender === 'user' ? 'bg-cyan-500/10 text-white border-cyan-500/20 rounded-tr-none' : 'glass-card text-on-surface-variant border-white/5 rounded-tl-none'}`}>
                  
                  {/* Uploaded image inside chat bubble */}
                  {msg.image && (
                    <div className="mb-2.5 rounded-lg overflow-hidden border border-white/10 max-w-[180px]">
                      <img src={msg.image} alt="Uploaded attachment" className="w-full h-auto object-cover max-h-[140px]" />
                    </div>
                  )}

                  {/* Body text formatting */}
                  <div>{formatMessageText(msg.text)}</div>

                  {/* Bubble Quick Actions */}
                  {msg.sender === 'assistant' && (
                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="text-[9px] font-bold text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[8px] text-outline block text-right font-semibold uppercase tracking-wider px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator / Stepper */}
          {typing && (
            <div className="flex gap-3 max-w-[90%] mr-auto items-start">
              <div className="w-8 h-8 rounded-xl bg-surface-container border border-white/10 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="glass-card rounded-2xl rounded-tl-none p-4 border border-white/5 space-y-2.5 shadow-md flex-grow">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {processingStage === 1 ? "Receiving Input..." :
                     processingStage === 2 ? "Extracting Document Content..." :
                     processingStage === 3 ? "Checking Threat Registry..." :
                     processingStage === 4 ? "Calculating Fraud Confidence..." :
                     "Generating Explainable AI..."}
                  </span>
                </div>
                <div className="w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-500" 
                    style={{ width: `${processingStage * 20}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Error Boundary Banner inside chat window */}
          {errorMessage && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-[11px] text-red-400 flex items-center gap-2 mx-4 animate-pulse">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <div className="flex-grow">
                <span>Central node connection timed out.</span>
              </div>
              <button
                onClick={handleRegenerate}
                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold uppercase text-[9px] rounded border border-red-500/30 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Dock */}
        <div className="pt-3 border-t border-white/5 space-y-3 bg-[#0D1117] relative z-20">
          
          {/* Emergency Alert Banner */}
          {emergencyAlert && emergencyAlert.active && (
            <div className="p-4 bg-red-950/40 border border-red-500/35 rounded-xl space-y-3.5 animate-pulse shadow-2xl">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block">CRITICAL THREAT TRIGGERED</span>
                  <span className="font-extrabold text-xs text-white">Emergency Mode Activated ({emergencyAlert.score}% Risk)</span>
                </div>
              </div>
              
              <p className="text-[10px] text-red-200/80 leading-relaxed">
                Sentinel AI has detected immediate fraud vectors (Government Impersonation / OTP coercion). Do not transfer funds or share credentials.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmergencyAlert(null);
                    showSuccessToast('Blocked sender logs saved.');
                  }}
                  className="py-2.5 bg-red-500 text-white hover:bg-red-400 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer"
                >
                  Block Sender
                </button>
                <button
                  type="button"
                  onClick={() => {
                    router.push('/emergency');
                  }}
                  className="py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider text-center border border-white/10 cursor-pointer"
                >
                  File Complaint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showSuccessToast('Alerted trusted contacts.');
                  }}
                  className="py-2.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center col-span-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
                >
                  Alert Trusted Contacts
                </button>
              </div>
            </div>
          )}

          {/* Selected File Attachment Preview Box */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl max-h-[80px] overflow-y-auto">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 rounded-lg text-[9px] font-mono">
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="text-[#8b949e] hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chat Form panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-end gap-2 w-full pb-2"
          >
            {/* Multi-Format File Attachment Trigger */}
            <input
              type="file"
              accept="image/*,application/pdf,.docx,.txt,.eml,.email,.mp3,.wav,.m4a"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl bg-[#161B22] border border-white/5 text-outline hover:text-white hover:border-cyan-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field */}
            <div className="flex-grow glass-card rounded-xl border border-white/10 px-3 py-1.5 text-xs flex items-center focus-within:border-cyan-400 transition-colors bg-[#161B22]/40">
              <textarea
                ref={textareaRef}
                value={inputText}
                rows={1}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputText);
                  }
                }}
                placeholder="Query Scam Shield Copilot..."
                className="w-full bg-transparent border-none py-2 text-xs text-on-surface placeholder-outline focus:outline-none resize-none min-h-[24px] max-h-[120px] leading-relaxed"
              />
            </div>
            
            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() && attachedFiles.length === 0}
              className="p-3.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors active-press flex items-center justify-center shadow-lg shadow-cyan-500/15 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>

      {/* Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 py-2.5 bg-[#161B22]/90 backdrop-blur-xl border-t border-[#30363d]/50 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        
        {/* Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex flex-col items-center justify-center text-[#8b949e] hover:text-[#00D9FF] transition-colors"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[8.5px] font-extrabold mt-1.5 uppercase tracking-wider">Dashboard</span>
        </button>

        {/* Threats */}
        <button
          onClick={() => router.push('/protection')}
          className="flex flex-col items-center justify-center text-[#8b949e] hover:text-[#00D9FF] transition-colors"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[8.5px] font-extrabold mt-1.5 uppercase tracking-wider">Threats</span>
        </button>

        {/* Center Simulated call */}
        <button
          onClick={() => {
            // Trigger simulated phone call
            startSimulatedPhoneCall();
            router.push('/monitoring');
          }}
          className="flex items-center justify-center bg-[#161B22]/90 text-[#00D9FF] border border-[#00D9FF]/40 rounded-full w-14 h-14 -translate-y-3.5 shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_25px_rgba(0,217,255,0.55)] active:scale-90 transition-all hover:border-[#00D9FF] relative z-45 group backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-[#00D9FF]/5 rounded-full blur-[8px] animate-pulse"></div>
          <Volume2 className="w-6 h-6 group-hover:scale-105 transition-transform" />
        </button>

        {/* Assistant */}
        <button
          onClick={() => router.push('/assistant')}
          className="flex flex-col items-center justify-center text-[#00D9FF] relative"
        >
          <div className="absolute top-[-6px] w-6 h-1 bg-[#00D9FF] rounded-full filter blur-[2px] opacity-70"></div>
          <Bot className="w-5 h-5 icon-glow" />
          <span className="text-[8.5px] font-extrabold mt-1.5 uppercase tracking-wider">Assistant</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center justify-center text-[#8b949e] hover:text-[#00D9FF] transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[8.5px] font-extrabold mt-1.5 uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
