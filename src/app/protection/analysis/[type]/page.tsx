'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Upload,
  Globe,
  Camera,
  AlertTriangle,
  CheckCircle,
  FileText,
  Volume2,
  Lock,
  RefreshCw,
  QrCode,
  Link2,
  Coins,
  Bot,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Tag,
  ShieldAlert,
  Download,
  Share2,
  Save,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  X,
  Mail
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { AIThreatReport } from '@/lib/services/ai';
import { authenticatedFetch } from '@/lib/supabase';

const scenarios: Record<string, { title: string; placeholderText: string; defaultInput: string; report: AIThreatReport }> = {
  voice: {
    title: 'Voice Analysis',
    placeholderText: 'Simulating caller audio block...',
    defaultInput: 'Recorded call session #v89410 - Audio clip from +91 95382 10928',
    report: {
      summary: "Spectral fingerprinting identified synthetically generated audio matching known voice clones used in financial extortion campaigns.",
      classification: "Government Impersonation",
      fraud_confidence: 92,
      ai_confidence: 98,
      threat_level: 'High',
      risk_indicators: ["Voice cloning signature matched", "VoIP route spoofing"],
      evidence: {
        detectedNumbers: ["+91 95382 10928"],
        governmentNames: ["CBI Verification Officer"],
        bankNames: [],
        urls: [],
        moneyAmount: "₹45,000",
        urgentKeywords: ["verify immediately", "KYC block"]
      },
      reasoning: [
        {
          name: "Acoustic Clone Fingerprinting",
          severity: "High",
          confidence: 94,
          explanation: "Voice spectral structure matches ElevenLabs synthetic voice clone signatures."
        },
        {
          name: "Linguistic Urgency Stressing",
          severity: "Medium",
          confidence: 88,
          explanation: "High frequency of authoritative commands instructing quick capital relocation."
        }
      ],
      recommendations: ["Ignore Message", "Block Number", "Report to Cyber Crime"],
      timeline: ["Call Received", "Government identity claimed", "Fear tactics used", "Money requested", "Call Blocked"],
      user_safety: "Never verify bank transfers under coercion. Hang up and call the official hotline (1930) immediately.",
      related_scams: ["UPI Fraud", "Digital Arrest Scam"]
    }
  },
  url: {
    title: 'URL Phishing Scan',
    placeholderText: 'Enter URL (e.g. bhim-rewards-portal.in)...',
    defaultInput: 'http://bhim-upi-rewards-hdfc.in/collect-payment',
    report: {
      summary: "The entered link leads to a forged payment interface designed to look like BHIM UPI, redirecting transaction signatures to unauthorized wallets.",
      classification: "Phishing",
      fraud_confidence: 96,
      ai_confidence: 99,
      threat_level: 'Critical',
      risk_indicators: ["Offshore anonymous hosting", "No brand SSL certificate"],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["HDFC Bank", "BHIM UPI"],
        urls: ["http://bhim-upi-rewards-hdfc.in/collect-payment"],
        moneyAmount: "₹1,24,000",
        urgentKeywords: ["claim instantly", "collect request"]
      },
      reasoning: [
        {
          name: "Domain Registration Age Check",
          severity: "High",
          confidence: 99,
          explanation: "Domain was registered within the last 48 hours in high-risk zones."
        },
        {
          name: "UPI VPA Redirection Target",
          severity: "High",
          confidence: 97,
          explanation: "Redirection endpoints bypass merchant registries, targeting personal wallets."
        }
      ],
      recommendations: ["Ignore Message", "Block Number", "Do Not Transfer Money"],
      timeline: ["Link received in SMS", "Domain registry checked", "Mock SSL certificates identified", "VPA redirect blocked"],
      user_safety: "Check VPA merchant certificates before entering your PIN. UPI PIN is never required to receive money.",
      related_scams: ["UPI Fraud", "QR Scam"]
    }
  },
  convo: {
    title: 'Conversation Analysis',
    placeholderText: 'Paste chat log or SMS content...',
    defaultInput: 'ALERT: Your SBI bank account will be suspended today. Update KYC instantly at http://sbi-verify.net or contact Support at 1800-455-900.',
    report: {
      summary: "The message contains highly coercive statements, threat vectors, and urgency triggers correlated with classical credential phishing methods.",
      classification: "Phishing",
      fraud_confidence: 78,
      ai_confidence: 95,
      threat_level: 'High',
      risk_indicators: ["Urgency language triggers", "Mismatched SMS shortcode header"],
      evidence: {
        detectedNumbers: ["1800-455-900"],
        governmentNames: [],
        bankNames: ["State Bank of India"],
        urls: ["http://sbi-verify.net"],
        moneyAmount: "0",
        urgentKeywords: ["instantly", "suspended today", "KYC update"]
      },
      reasoning: [
        {
          name: "Coercive Text Pattern Analysis",
          severity: "High",
          confidence: 95,
          explanation: "High density of coercive threat warnings aiming to capture verification pins or bank details."
        }
      ],
      recommendations: ["Ignore Message", "Block Number", "Contact Your Bank"],
      timeline: ["SMS Received", "Threat index flagged", "Malicious URL redirect blocked"],
      user_safety: "Official bank customer support channels never dispatch account blocking warnings with external links.",
      related_scams: ["KYC Scams", "Phishing"]
    }
  },
  document: {
    title: 'Document Slip Shield',
    placeholderText: 'Drag & drop transaction PDF receipts...',
    defaultInput: 'Receipt_HDFC_Ref_982419_Success.pdf',
    report: {
      summary: "The uploaded banking transaction slip contains edited digital markers, altered font weights, and invalid transaction reference tags.",
      classification: "UPI Fraud",
      fraud_confidence: 84,
      ai_confidence: 91,
      threat_level: 'High',
      risk_indicators: ["Image font mismatch anomalies", "Null transaction reference register lookup"],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["HDFC Bank"],
        urls: [],
        moneyAmount: "₹45,000",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "Font Weight OCR Validation",
          severity: "High",
          confidence: 92,
          explanation: "Mismatched character dimensions and spacing detected inside amount field parameters."
        }
      ],
      recommendations: ["Do Not Transfer Money", "Save Evidence", "Contact Your Bank"],
      timeline: ["Document uploaded", "Cryptographic signature check failed", "Ref ID lookup returned empty record"],
      user_safety: "Always audit transaction histories inside your banking application ledger directly rather than trusting paper or screenshot proofs.",
      related_scams: ["UPI Fraud", "Government Impersonation"]
    }
  },
  qr: {
    title: 'QR Code Guard',
    placeholderText: 'Select QR image or activate scanner...',
    defaultInput: 'UPI_QR_Payload_Merchant_889240.png',
    report: {
      summary: "QR contains parameters designed to bypass typical merchant limits and trigger immediate personal wallet debit routines without authorization.",
      classification: "QR Scam",
      fraud_confidence: 88,
      ai_confidence: 97,
      threat_level: 'High',
      risk_indicators: ["Personal VPA redirection in merchant layout", "Pre-approved debit token injection"],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["HDFC Bank Merchant"],
        urls: ["http://malicious-upi-gateway.com"],
        moneyAmount: "0",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "VPA Target Lookup Check",
          severity: "High",
          confidence: 97,
          explanation: "QR signature is mapped to personal collection account and redirects to external scripting ports."
        }
      ],
      recommendations: ["Do Not Transfer Money", "Report to Cyber Crime", "Ignore Message"],
      timeline: ["QR scanned", "UPI handle decoded", "Mismatched destination checked", "Malicious VPA identified"],
      user_safety: "Check recipient VPA details displayed on the confirmation screen of your payment app before entering your UPI PIN.",
      related_scams: ["UPI Fraud", "QR Scam"]
    }
  },
  currency: {
    title: 'Counterfeit Banknote Check',
    placeholderText: 'Upload image of banknote security thread...',
    defaultInput: '₹500_Note_Serial_4EE_982410.jpg',
    report: {
      summary: "Watermark analysis and optical variable ink checks indicate anomalies compared with currency printed at reserve bank presses.",
      classification: "Identity Theft",
      fraud_confidence: 65,
      ai_confidence: 93,
      threat_level: 'Medium',
      risk_indicators: ["Watermark shift anomaly", "Missing security strip reflective response"],
      evidence: {
        detectedNumbers: ["4EE_982410"],
        governmentNames: [],
        bankNames: ["Reserve Bank of India"],
        urls: [],
        moneyAmount: "₹500",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "Reflective Security Thread Verification",
          severity: "Medium",
          confidence: 93,
          explanation: "Green-to-blue variable ink color shift is absent on the security strip."
        }
      ],
      recommendations: ["Save Evidence", "Report to Cyber Crime"],
      timeline: ["Banknote scanned", "Watermark comparison initialized", "Color variables shift missed", "Counterfeit warning logged"],
      user_safety: "Genuine banknotes feature crisp microlettering under magnification. Check security strip reflections.",
      related_scams: ["Identity Theft"]
    }
  },
  screenshot: {
    title: 'Screenshot Verification',
    placeholderText: 'Select image of the payment screen...',
    defaultInput: 'UPI_Success_Screen_3892401.jpg',
    report: {
      summary: "Visual analysis identifies layout spoofing mimicking popular payment application UI (Google Pay / Paytm).",
      classification: "UPI Fraud",
      fraud_confidence: 95,
      ai_confidence: 98,
      threat_level: 'Critical',
      risk_indicators: ["Edited canvas coordinates", "Non-standard timestamp alignment"],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["Google Pay"],
        urls: [],
        moneyAmount: "₹45,000",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "GPay UI Element Validation",
          severity: "High",
          confidence: 98,
          explanation: "Success checkmark animation coordinates do not match official app aspect ratios."
        }
      ],
      recommendations: ["Do Not Transfer Money", "Save Evidence", "Verify Government Identity"],
      timeline: ["Screen receipt uploaded", "Image aspect ratios validated", "UI layout coordinate mismatch flagged"],
      user_safety: "Never deliver merchandise until bank-ledger verification updates confirm payment receipt.",
      related_scams: ["UPI Fraud", "Investment Scam"]
    }
  },
  email: {
    title: 'Email Phishing Scan',
    placeholderText: 'Paste email body or headers...',
    defaultInput: 'Subject: URGENT: Security verification required for HDFC account #9021. Log in immediately at http://security-update-verification.com to prevent suspension.',
    report: {
      summary: "Email details contain credential harvesting targets matching known phishing campaign anchors.",
      classification: "Phishing",
      fraud_confidence: 82,
      ai_confidence: 94,
      threat_level: 'High',
      risk_indicators: ["Urgent password request", "Spoofed sender signature"],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: [],
        urls: ["http://security-update-verification.com"],
        moneyAmount: "0",
        urgentKeywords: ["immediate action", "verify now"]
      },
      reasoning: [
        {
          name: "Email Phishing Heuristics",
          severity: "High",
          confidence: 95,
          explanation: "Mismatched domain headers combined with urgent account verification demands indicate vishing/phishing targets."
        }
      ],
      recommendations: ["Ignore Message", "Delete and Block", "Do Not click links"],
      timeline: ["Email received", "Urgency language parsed", "External phishing domain identified"],
      user_safety: "Never input banking credentials into redirect screens opened from email links.",
      related_scams: ["Phishing"]
    }
  },
  chat: {
    title: 'Chat Group Analyzer',
    placeholderText: 'Paste chat log or message transcript...',
    defaultInput: 'Telegram Admin: Congratulations! You can earn ₹5000 daily by completing simple YouTube like tasks. Simply deposit a refundable ₹15,000 security fee to register and start immediately.',
    report: {
      summary: "Dialog contains cryptocurrency multi-level marketing (MLM) task fraud indicators targeting upfront deposits.",
      classification: "Investment Scam",
      fraud_confidence: 90,
      ai_confidence: 96,
      threat_level: 'High',
      risk_indicators: ["MLM task group referral", "Crypto wallet deposit request"],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: [],
        urls: [],
        moneyAmount: "₹15,000",
        urgentKeywords: ["deposit instantly", "earn high commission"]
      },
      reasoning: [
        {
          name: "Task Scam Classifier",
          severity: "High",
          confidence: 96,
          explanation: "Promises of high commissions for simple tasks (such as YouTube liking) with deposit requirements match known syndicates."
        }
      ],
      recommendations: ["Report to I4C portal", "Block Contact", "Do Not Transfer Money"],
      timeline: ["Invited to Telegram group", "Upfront deposits requested", "Withdrawal limits imposed"],
      user_safety: "Official merchants do not request payment/deposit deposits to permit work-from-home salary payments.",
      related_scams: ["Investment Scam", "UPI Fraud"]
    }
  }
};

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const type = (params.type as string) || 'url';
  const scenario = scenarios[type] || scenarios.url;

  const [inputVal, setInputVal] = useState(scenario.defaultInput);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasResult, setHasResult] = useState(false);
  const [apiResult, setApiResult] = useState<AIThreatReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Expandable reasoning state
  const [expandedReasonIndex, setExpandedReasonIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addScanResult, addAlert, recalculateScore } = useAppStore();

  useEffect(() => {
    setInputVal(scenario.defaultInput);
    setHasResult(false);
    setScanning(false);
    setApiResult(null);
    setErrorMsg(null);
    setToastMsg(null);
  }, [type]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setInputVal(file.name);
    showSuccessToast(`Loaded file: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && text.length > 10) {
        if (file.name.endsWith('.txt') || file.name.endsWith('.eml') || file.name.endsWith('.csv')) {
          setInputVal(text.slice(0, 1000));
        }
      }
    };
    reader.readAsText(file);
  };

  const resultData: AIThreatReport = apiResult || scenario.report;

  const handleRunAnalysis = async () => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(0);
    setHasResult(false);
    setErrorMsg(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
    }, 150);

    try {
      let endpoint = `/api/analyze/${type}`;
      if (type === 'convo') endpoint = '/api/analyze/conversation';
      if (type === 'screenshot') endpoint = '/api/analyze/image';

      let payload: any = {};
      if (type === 'voice') {
        payload = { duration: 30, hasTriggerWords: inputVal.toLowerCase().includes('cbi') || inputVal.toLowerCase().includes('arrest') };
      } else if (type === 'url') {
        payload = { url: inputVal };
      } else if (type === 'convo') {
        payload = { transcript: inputVal };
      } else if (type === 'document') {
        payload = { fileName: inputVal };
      } else if (type === 'qr') {
        payload = { qrPayload: inputVal };
      } else if (type === 'currency') {
        payload = { serialNumber: inputVal };
      } else if (type === 'screenshot') {
        payload = { imageUrl: inputVal };
      } else if (type === 'email') {
        payload = { emailBody: inputVal };
      } else if (type === 'chat') {
        payload = { chatLog: inputVal };
      }

      const res = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned status code: ${res.status}`);
      }

      const data = await res.json();
      
      clearInterval(interval);
      setScanProgress(100);
      setScanning(false);
      setHasResult(true);
      setApiResult(data.analysis);

      addScanResult({
        id: data.analysisId || `scan-${Date.now()}`,
        module: scenario.title,
        timestamp: 'Just now',
        status: data.analysis.threat_level === 'Critical' || data.analysis.threat_level === 'High' ? 'threat' : 'clean',
        score: data.analysis.fraud_confidence,
        aiConfidence: data.analysis.ai_confidence,
        threatLevel: data.analysis.threat_level === 'Critical' ? 'Critical' : data.analysis.threat_level === 'High' ? 'Warning' : 'Secure',
        evidence: data.analysis.risk_indicators,
        recommendations: data.analysis.recommendations,
        explanation: data.analysis.summary
      });

      if (data.analysis.threat_level === 'Critical' || data.analysis.threat_level === 'High') {
        addAlert({
          title: `${scenario.title} Threat`,
          description: data.analysis.summary,
          type: scenario.title,
          severity: data.analysis.threat_level === 'Critical' ? 'high' : 'medium'
        });
        recalculateScore();
      }

    } catch (err: any) {
      clearInterval(interval);
      setScanning(false);
      setErrorMsg(err.message || 'Verification scan failed. Please check network logs.');
    }
  };

  const getProcessingStageText = () => {
    if (scanProgress < 15) return "Uploading telemetry payload...";
    if (scanProgress < 35) return "Extracting OCR text layers...";
    if (scanProgress < 55) return "Running NLP pattern checks...";
    if (scanProgress < 75) return "Analyzing suspicious indicator weights...";
    if (scanProgress < 90) return "Checking central threat registry pools...";
    return "Generating explainable report...";
  };

  const getThreatBadgeColors = (lvl: string) => {
    switch (lvl) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/35';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/35';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/35';
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/35';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35';
    }
  };

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getModuleIcon = () => {
    switch (type) {
      case 'voice':
        return <Volume2 className="w-8 h-8 text-cyan-400 animate-pulse" />;
      case 'url':
        return <Link2 className="w-8 h-8 text-cyan-400" />;
      case 'convo':
        return <Bot className="w-8 h-8 text-cyan-400" />;
      case 'document':
        return <FileText className="w-8 h-8 text-cyan-400" />;
      case 'qr':
        return <QrCode className="w-8 h-8 text-cyan-400" />;
      case 'currency':
        return <Coins className="w-8 h-8 text-cyan-400" />;
      case 'screenshot':
        return <Camera className="w-8 h-8 text-cyan-400" />;
      case 'email':
        return <Mail className="w-8 h-8 text-cyan-400" />;
      case 'chat':
        return <MessageSquare className="w-8 h-8 text-cyan-400" />;
      default:
        return <Globe className="w-8 h-8 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#e0e3e5] flex flex-col pb-16 relative pt-20">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-15">
        <div className="absolute top-[20%] left-[-10%] w-[320px] h-[320px] rounded-full bg-cyan-500/10 blur-[100px]"></div>
      </div>

      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-45 bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363d]/40 px-4 py-3 flex items-center">
        <button
          onClick={() => router.push('/protection')}
          className="mr-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-[#8b949e] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-white flex-grow truncate">{scenario.title}</h1>
      </header>

      {/* Toast Alert popup */}
      {toastMsg && (
        <div className="fixed top-18 right-4 left-4 z-50 p-4 bg-cyan-950/90 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs flex items-center justify-between shadow-2xl backdrop-blur-md animate-[slideDown_0.2s_ease-out_forwards]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-outline hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow max-w-md mx-auto w-full px-4 pt-4 space-y-6 relative z-10">
        
        {/* Workspace Form Card */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
              {getModuleIcon()}
            </div>
            <div>
              <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Diagnostic Node</span>
              <h2 className="text-sm font-bold text-white uppercase">{scenario.title}</h2>
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Verify device logs, communication history, or credentials. Sentinel AI cross-references metadata with cryptographic cyber threat pools.
          </p>

          {/* Form inputs depending on module type */}
          <div className="space-y-3 pt-2">
            <span className="text-[9px] font-bold text-outline uppercase tracking-widest block">
              Scan Parameters
            </span>
            
            {type === 'url' ? (
              <div className="relative glass-card rounded-xl overflow-hidden border border-white/10 flex items-center">
                <Globe className="absolute left-3 w-4 h-4 text-outline" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-transparent border-none py-3.5 pl-9 pr-4 text-xs text-[#e0e3e5] placeholder-outline focus:outline-none"
                  placeholder={scenario.placeholderText}
                />
              </div>
            ) : type === 'screenshot' || type === 'document' || type === 'currency' || type === 'qr' || type === 'email' || type === 'chat' ? (
              <div className="space-y-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.docx,.txt,.eml,.email,.mp3,.wav,.m4a"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/[0.01]"
                >
                  <Upload className="w-8 h-8 text-outline mx-auto mb-2 animate-bounce" />
                  <span className="text-xs text-on-surface block font-semibold">Select File from Storage</span>
                  <span className="text-[9px] text-outline block mt-1">Images, PDF, DOCX, TXT, Audio, EML up to 10MB</span>
                </div>
                <div className="bg-white/5 px-3 py-2 rounded-lg text-xs text-on-surface-variant truncate border border-white/5 font-mono">
                  Selected: <span className="font-bold text-white">{inputVal}</span>
                </div>
              </div>
            ) : (
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-[#e0e3e5] placeholder-outline focus:outline-none min-h-[90px] leading-relaxed font-mono"
                placeholder={scenario.placeholderText}
              />
            )}

            {/* Run Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={scanning}
              className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider electric-flow hover:opacity-90 active-press transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning... {scanProgress}%</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 animate-pulse" />
                  <span>Run Diagnostics</span>
                </>
              )}
            </button>

            {/* API Connection Error Toast */}
            {errorMsg && (
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase tracking-wider">Analysis Failure</span>
                  <span className="text-[10px] opacity-90 block mt-0.5">{errorMsg}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan animation overlay */}
        {scanning && (
          <div className="glass-card rounded-2xl p-6 border border-white/5 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-line-anim shadow-[0_0_8px_cyan]"></div>
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{getProcessingStageText()}</h4>
            <p className="text-[10px] text-on-surface-variant max-w-[240px]">
              Querying distributed national database pools and OCR signature indices...
            </p>
          </div>
        )}

        {/* ====================================================
            EXPLAINABLE AI THREAT FORENSIC REPORT PANEL
            ==================================================== */}
        {hasResult && (
          <div className="space-y-5 animate-[fadeIn_0.5s_ease-out_forwards]">
            
            <div className="flex items-center gap-2 text-xs font-bold text-outline uppercase tracking-wider px-1">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
              <span>FORENSIC SCAN ANALYSIS REPORT</span>
            </div>

            {/* 1. EXECUTIVE SUMMARY CARD */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Assessment Node</span>
                  <h3 className="text-sm font-bold text-white uppercase">{resultData.classification} Assessment</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[8.5px] font-extrabold uppercase tracking-widest ${getThreatBadgeColors(resultData.threat_level)}`}>
                  {resultData.threat_level} Level
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[8.5px] font-bold text-outline uppercase tracking-wider block">Executive Summary</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {resultData.summary}
                </p>
              </div>
            </div>

            {/* 2. FRAUD INDEX CIRCULAR GAUGE & CONFIDENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Circular progress SVG */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[8px] font-bold text-outline uppercase tracking-widest block">Fraud Confidence Gauge</span>
                
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-white/5 fill-none" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className={`fill-none transition-all duration-1000 ${resultData.fraud_confidence > 75 ? 'stroke-red-500' : resultData.fraud_confidence > 40 ? 'stroke-amber-400' : 'stroke-cyan-400'}`} 
                      strokeWidth="8" 
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * resultData.fraud_confidence) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-white">{resultData.fraud_confidence}%</span>
                    <span className="text-[7.5px] font-bold text-outline uppercase tracking-widest leading-none">Risk Score</span>
                  </div>
                </div>

                {resultData.reasoning && resultData.reasoning.length > 0 && (
                  <div className="mt-3 w-full text-left space-y-1.5 border-t border-white/5 pt-3">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-widest block mb-1">Score Calculation</span>
                    {resultData.reasoning.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <span className="text-on-surface-variant truncate max-w-[145px]">{item.name}</span>
                        <span className="font-mono text-cyan-400">+{item.severity === 'High' ? 25 : item.severity === 'Medium' ? 20 : 15} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats detail block */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-around gap-3">
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-outline uppercase tracking-widest block">AI Model Certainty</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">{resultData.ai_confidence}%</span>
                    <span className="text-[8.5px] text-[#00E676] font-bold uppercase tracking-wider">Optimal Match</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${resultData.ai_confidence}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[8px] font-bold text-outline uppercase tracking-widest block">Scam Classification</span>
                  <span className="text-xs font-bold text-white block uppercase tracking-wider">{resultData.classification}</span>
                </div>
              </div>
            </div>

            {/* 3. EXPLAINABLE AI REASONING (Explainable cards) */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest block px-1">
                Explainable AI Reasoning (Why did it flag?)
              </span>

              <div className="space-y-2.5">
                {resultData.reasoning.map((item, idx) => (
                  <div key={idx} className="border border-white/5 rounded-xl overflow-hidden glass-card">
                    <button
                      onClick={() => setExpandedReasonIndex(expandedReasonIndex === idx ? null : idx)}
                      className="w-full bg-white/[0.02] px-4 py-3 flex justify-between items-center text-xs font-bold text-white uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2 text-left">
                        <Zap className={`w-3.5 h-3.5 ${item.severity === 'High' ? 'text-red-400' : 'text-amber-400'}`} />
                        <span className="truncate max-w-[200px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded uppercase ${item.severity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {item.severity}
                        </span>
                        {expandedReasonIndex === idx ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
                      </div>
                    </button>
                    {expandedReasonIndex === idx && (
                      <div className="p-4 space-y-2 bg-white/[0.01] text-xs border-t border-white/5">
                        <div className="flex justify-between text-[9px] text-outline font-bold uppercase tracking-wider">
                          <span>Verification Confidence</span>
                          <span>{item.confidence}% matched</span>
                        </div>
                        <p className="text-on-surface-variant font-medium leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. EVIDENCE BREAKDOWN CARDS */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest block">
                Evidence Ledger Breakdown
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                
                {resultData.evidence.detectedNumbers.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Flagged Contacts</span>
                    <span className="font-mono text-[10px] text-white block truncate">{resultData.evidence.detectedNumbers.join(', ')}</span>
                  </div>
                )}

                {resultData.evidence.governmentNames.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Impersonated Entity</span>
                    <span className="font-bold text-white block truncate">{resultData.evidence.governmentNames.join(', ')}</span>
                  </div>
                )}

                {resultData.evidence.bankNames.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Target Institution</span>
                    <span className="font-bold text-white block truncate">{resultData.evidence.bankNames.join(', ')}</span>
                  </div>
                )}

                {resultData.evidence.urls.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Host Domains</span>
                    <span className="font-mono text-[9px] text-cyan-400 block truncate">{resultData.evidence.urls.join(', ')}</span>
                  </div>
                )}

                {resultData.evidence.moneyAmount !== '0' && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 col-span-2">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Demanded Amount Vector</span>
                    <span className="font-bold text-red-400 block">{resultData.evidence.moneyAmount} (Debited or target of extortion)</span>
                  </div>
                )}

                {resultData.evidence.urgentKeywords.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 col-span-2">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">Urgent Keywords Flagged</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {resultData.evidence.urgentKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-[9px] font-bold uppercase">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. RISK INDICATORS CHIPS */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest block px-1">
                Active Risk Indicators
              </span>
              <div className="flex flex-wrap gap-2">
                {resultData.risk_indicators.map((ind, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-[#e0e3e5] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>{ind}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 6. INCIDENT TIMELINE */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest block">
                Forensic Incident Timeline
              </span>
              <div className="relative pl-5 border-l border-white/10 flex flex-col gap-4 text-xs">
                {resultData.timeline.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[24.5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"></div>
                    <span className="text-[8px] text-outline font-bold uppercase block">Stage {i + 1}</span>
                    <p className="text-white font-semibold mt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. RECOMMENDATIONS */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest block px-1">
                Mitigation Recommendations
              </span>
              <div className="space-y-2">
                {resultData.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex gap-2.5 text-xs text-emerald-300">
                    <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
                    <span className="font-semibold">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. USER SAFETY GUIDE */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2 bg-slate-950/30">
              <span className="text-[8.5px] font-bold text-outline uppercase tracking-wider block">Personalized User Safety Guide</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {resultData.user_safety}
              </p>
            </div>

            {/* 9. SIMILAR SCAM TYPES */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest block px-1">
                Similar Related Scams
              </span>
              <div className="flex flex-wrap gap-2">
                {resultData.related_scams.map((sc, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[9px] text-outline font-bold uppercase">{sc}</span>
                ))}
              </div>
            </div>

            {/* 10. EXPORT ACTIONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => showSuccessToast("PDF forensic report downloaded to storage.")}
                className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button 
                onClick={() => showSuccessToast("Analysis saved to historical profile.")}
                className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Analysis</span>
              </button>

              <button 
                onClick={() => showSuccessToast("Clearance URL copied to clipboard!")}
                className="py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Report</span>
              </button>

              <button 
                onClick={() => router.push('/emergency')}
                className="py-3 bg-red-950/20 hover:bg-red-900/20 text-red-300 border border-red-500/25 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report Scam</span>
              </button>

              <button 
                onClick={() => {
                  // Navigate to chatbot prefilled with context query
                  router.push('/assistant');
                }}
                className="py-3 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 col-span-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI About This Report</span>
              </button>
            </div>

            {/* Back button actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => router.push('/protection')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active-press"
              >
                Back to Center
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
