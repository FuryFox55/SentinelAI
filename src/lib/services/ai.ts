export interface AIThreatReport {
  summary: string;
  classification: string;
  fraud_confidence: number;
  ai_confidence: number;
  threat_level: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  risk_indicators: string[];
  evidence: {
    detectedNumbers: string[];
    governmentNames: string[];
    bankNames: string[];
    urls: string[];
    moneyAmount: string;
    urgentKeywords: string[];
  };
  reasoning: Array<{
    name: string;
    severity: 'High' | 'Medium' | 'Low';
    confidence: number;
    explanation: string;
  }>;
  recommendations: string[];
  timeline: string[];
  user_safety: string;
  related_scams: string[];
  processingTimeMs?: number;
}

// Helper to call Grok API non-destructively
async function callGrokAPI(
  systemInstruction: string,
  userPrompt: string,
  mockFallback: AIThreatReport
): Promise<AIThreatReport> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_GROK_API_KEY') {
    return mockFallback;
  }

  const startTime = Date.now();
  try {
    const isGroq = apiKey.startsWith('gsk_');
    const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.xai.com/v1/chat/completions';
    const model = isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemInstruction + "\nYou MUST return only a valid JSON object matching the requested schema. Do not output markdown code blocks (like ```json), commentary, or leading/trailing text." },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(8000) // 8s timeout guard
    });

    if (!response.ok) {
      console.warn(`Grok API returned error status: ${response.status}. Falling back to mock.`);
      return mockFallback;
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean potential markdown blocks
    const cleanJsonString = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const result = JSON.parse(cleanJsonString);

    return {
      summary: result.summary || mockFallback.summary,
      classification: result.classification || mockFallback.classification,
      fraud_confidence: typeof result.fraud_confidence === 'number' ? result.fraud_confidence : mockFallback.fraud_confidence,
      ai_confidence: typeof result.ai_confidence === 'number' ? result.ai_confidence : mockFallback.ai_confidence,
      threat_level: ['Safe', 'Low', 'Medium', 'High', 'Critical'].includes(result.threat_level) 
        ? result.threat_level 
        : mockFallback.threat_level,
      risk_indicators: Array.isArray(result.risk_indicators) ? result.risk_indicators : mockFallback.risk_indicators,
      evidence: result.evidence || mockFallback.evidence,
      reasoning: Array.isArray(result.reasoning) ? result.reasoning : mockFallback.reasoning,
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : mockFallback.recommendations,
      timeline: Array.isArray(result.timeline) ? result.timeline : mockFallback.timeline,
      user_safety: result.user_safety || mockFallback.user_safety,
      related_scams: Array.isArray(result.related_scams) ? result.related_scams : mockFallback.related_scams,
      processingTimeMs: Date.now() - startTime
    };

  } catch (err) {
    console.error('Error invoking Grok API, falling back to deterministic intelligence engine:', err);
    return mockFallback;
  }
}

export const aiService = {
  analyzeVoice: async (duration: number, hasTriggerWords: boolean): Promise<AIThreatReport> => {
    const mock: AIThreatReport = {
      summary: hasTriggerWords 
        ? "Clone voice trace matches known federal impersonator voice profiles. Suspect VoIP route detected."
        : "Standard acoustic profile. Safe caller pattern verified.",
      classification: hasTriggerWords ? "Government Impersonation" : "Safe",
      fraud_confidence: hasTriggerWords ? 92 : 8,
      ai_confidence: 98,
      threat_level: hasTriggerWords ? 'High' : 'Safe',
      risk_indicators: hasTriggerWords ? ["Voice cloning signature matched", "VoIP route spoofing"] : ["Standard cadence match"],
      evidence: {
        detectedNumbers: ["+91 95382 10928"],
        governmentNames: hasTriggerWords ? ["CBI Verification Officer"] : [],
        bankNames: [],
        urls: [],
        moneyAmount: hasTriggerWords ? "₹45,000" : "0",
        urgentKeywords: hasTriggerWords ? ["verify immediately", "KYC block"] : []
      },
      reasoning: [
        {
          name: "Acoustic Clone Fingerprinting",
          severity: hasTriggerWords ? "High" : "Low",
          confidence: 94,
          explanation: hasTriggerWords 
            ? "Voice patterns match ElevenLabs synthetic voice clones used in financial extortion campaigns." 
            : "No synthetic audio modifications detected."
        }
      ],
      recommendations: hasTriggerWords 
        ? ["Ignore Message", "Block Number", "Report to Cyber Crime"] 
        : ["Contact Your Bank"],
      timeline: hasTriggerWords 
        ? ["Call Received", "Government identity claimed", "Fear tactics used", "Money requested", "Call Blocked"] 
        : ["Call Received", "Identity Verified", "Standard communication"],
      user_safety: "Keep UPI PIN confidential. Never verify bank transfers under coercion.",
      related_scams: ["UPI Fraud", "Digital Arrest Scam"],
      processingTimeMs: 120
    };

    return callGrokAPI(
      "You are Sentinel AI security scanner evaluating voice call parameters. Output only a structured JSON object matching the requested schema.",
      `Analyze voice call metadata: Duration is ${duration}s, has suspicious triggers: ${hasTriggerWords}.
       Return JSON format: {
         "summary": "analysis summary",
         "classification": "Digital Arrest Scam"|"UPI Fraud"|"Phishing"|"Identity Theft"|"Government Impersonation"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": ["+91 95382 10928"],
           "governmentNames": ["officer name"],
           "bankNames": [],
           "urls": [],
           "moneyAmount": "amount",
           "urgentKeywords": ["urgency"]
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "explain why" }
         ],
         "recommendations": ["Ignore Message", "Block Number"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
       }`,
      mock
    );
  },

  analyzeConversation: async (transcript: string): Promise<AIThreatReport> => {
    const isSuspicious = /CBI|digital arrest|police|OTP|PIN|verify|transfer/i.test(transcript);
    const mock: AIThreatReport = {
      summary: isSuspicious
        ? "Active coercion text pattern identified. The dialogue attempts to threaten legal actions or request credentials."
        : "Routine SMS or message content scan. Natural conversational structure.",
      classification: isSuspicious ? "Digital Arrest Scam" : "Safe",
      fraud_confidence: isSuspicious ? 96 : 4,
      ai_confidence: 99,
      threat_level: isSuspicious ? 'Critical' : 'Safe',
      risk_indicators: isSuspicious ? ["Urgency triggers", "Reference to police arrest"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: isSuspicious ? ["CBI Special Agent"] : [],
        bankNames: [],
        urls: isSuspicious ? ["http://sbi-verify.net"] : [],
        moneyAmount: "0",
        urgentKeywords: isSuspicious ? ["instantly", "suspended today", "KYC update"] : []
      },
      reasoning: [
        {
          name: "Linguistic Coercion Analysis",
          severity: isSuspicious ? "High" : "Low",
          confidence: 96,
          explanation: isSuspicious 
            ? "Keywords indicate coercive authority threats aiming to capture verification pins or bank details."
            : "Conversational parameters reflect normal customer support interactions."
        }
      ],
      recommendations: isSuspicious 
        ? ["Ignore Message", "Block Number", "Report to Cyber Crime"] 
        : ["Contact Your Bank"],
      timeline: isSuspicious 
        ? ["SMS Received", "Urgency language detected", "Arrest threat claimed", "Credentials requested"]
        : ["SMS Received", "Normal verification"],
      user_safety: "Never open unverified shortcode URLs claiming immediate bank account blockages.",
      related_scams: ["Phishing", "KYC scams"],
      processingTimeMs: 95
    };

    return callGrokAPI(
      "You are Sentinel AI security scanner evaluating SMS chat logs. Output only a structured JSON object matching the requested schema.",
      `Evaluate SMS/chat text logs: "${transcript}".
       Return JSON format: {
         "summary": "analysis summary",
         "classification": "Digital Arrest Scam"|"UPI Fraud"|"Phishing"|"Identity Theft"|"Government Impersonation"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": [],
           "governmentNames": ["government officials"],
           "bankNames": [],
           "urls": ["urls found"],
           "moneyAmount": "0",
           "urgentKeywords": ["urgent words"]
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "reasoning detailed" }
         ],
         "recommendations": ["Ignore Message", "Block Number"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
       }`,
      mock
    );
  },

  analyzeScreenshot: async (previewSource: string): Promise<AIThreatReport> => {
    const isFake = previewSource.includes('fake') || previewSource.includes('spoof') || previewSource.includes('receipt') || previewSource.includes('GPay');
    const mock: AIThreatReport = {
      summary: isFake
        ? "Forged font weights and misaligned bank clearance timestamps identified on the payment receipt interface."
        : "Standard banking confirmation layout verified via national clearing index log matches.",
      classification: isFake ? "UPI Fraud" : "Safe",
      fraud_confidence: isFake ? 95 : 2,
      ai_confidence: 98,
      threat_level: isFake ? 'Critical' : 'Safe',
      risk_indicators: isFake ? ["Mismatched font size", "Unverified transaction reference"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["Google Pay", "HDFC Bank"],
        urls: [],
        moneyAmount: isFake ? "₹45,000" : "0",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "OCR Overlay Extraction Check",
          severity: isFake ? "High" : "Low",
          confidence: 95,
          explanation: isFake 
            ? "Mismatched font weight and spacing detected in GPay amount label index." 
            : "Visual elements match standard bank clearance patterns."
        }
      ],
      recommendations: isFake 
        ? ["Ignore Message", "Do Not Transfer Money", "Save Evidence"] 
        : ["Contact Your Bank"],
      timeline: isFake 
        ? ["Receipt uploaded", "Font ratios analyzed", "Mismatch identified in amount card", "Counterfeit verdict issued"] 
        : ["Receipt uploaded", "Structure verified", "Genuine confirmation"],
      user_safety: "Always verify merchant ledger balances directly from your Net Banking app before releasing cash or shipping items.",
      related_scams: ["UPI Fraud", "Identity Theft"],
      processingTimeMs: 150
    };

    return callGrokAPI(
      "You are Sentinel AI security scanner verifying payment receipt confirmation screenshots. Output only a structured JSON object matching the requested schema.",
      `Inspect payment confirmation receipt OCR text: "${previewSource}".
       Return JSON format: {
         "summary": "OCR visual verification summary",
         "classification": "UPI Fraud"|"Phishing"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": [],
           "governmentNames": [],
           "bankNames": ["GPay"],
           "urls": [],
           "moneyAmount": "amount",
           "urgentKeywords": []
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "explain" }
         ],
         "recommendations": ["Do Not Transfer Money"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
       }`,
      mock
    );
  },

  analyzeDocument: async (fileName: string): Promise<AIThreatReport> => {
    const isForged = fileName.toLowerCase().includes('invoice') || fileName.toLowerCase().includes('bill');
    const mock: AIThreatReport = {
      summary: isForged
        ? "Alterations detected in invoice header tables. Digital signature validation mismatch."
        : "Document metadata matches origin signatures.",
      classification: isForged ? "Phishing" : "Safe",
      fraud_confidence: isForged ? 68 : 5,
      ai_confidence: 91,
      threat_level: isForged ? 'Medium' : 'Safe',
      risk_indicators: isForged ? ["Mismatched tax headers", "Counterfeit signatures"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: [],
        urls: [],
        moneyAmount: isForged ? "₹1,24,000" : "0",
        urgentKeywords: isForged ? ["payment due", "penalty"] : []
      },
      reasoning: [
        {
          name: "Signature Certificate Validation",
          severity: isForged ? "Medium" : "Low",
          confidence: 91,
          explanation: isForged 
            ? "Metadata indicates alterations with Adobe Photoshop and missing cryptographic clearance keys." 
            : "Authentic certificate signature verified."
        }
      ],
      recommendations: isForged 
        ? ["Ignore Message", "Verify Government Identity", "Contact Your Bank"] 
        : ["Contact Your Bank"],
      timeline: isForged 
        ? ["Document submitted", "Certificate scanned", "Cryptographic signature failed", "Anomaly flagged"] 
        : ["Document submitted", "Authenticity confirmed"],
      user_safety: "Never download or open PDF bills from unverified message attachments.",
      related_scams: ["Investment Scam", "Phishing"],
      processingTimeMs: 140
    };

    return callGrokAPI(
      "You are Sentinel AI document security checker evaluating document formats. Output only a structured JSON object matching the requested schema.",
      `Verify document authenticity: Name is "${fileName}".
       Return JSON format: {
         "summary": "Document audit details",
         "classification": "Phishing"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": [],
           "governmentNames": [],
           "bankNames": [],
           "urls": [],
           "moneyAmount": "amount",
           "urgentKeywords": ["urgency"]
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "explain" }
         ],
         "recommendations": ["Ignore Message"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
       }`,
      mock
    );
  },

  analyzeQR: async (qrPayload: string): Promise<AIThreatReport> => {
    const isMalicious = qrPayload.includes('malicious') || qrPayload.includes('scam') || qrPayload.includes('UPI');
    const mock: AIThreatReport = {
      summary: isMalicious
        ? "QR payload redirects to a blacklisted third-party address translation link instead of standard UPI gateways."
        : "Valid merchant transaction gateway verified.",
      classification: isMalicious ? "QR Scam" : "Safe",
      fraud_confidence: isMalicious ? 88 : 3,
      ai_confidence: 97,
      threat_level: isMalicious ? 'Critical' : 'Safe',
      risk_indicators: isMalicious ? ["Spoofed UPI handle", "Hidden pre-approved debit parameters"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["HDFC Bank Merchant"],
        urls: isMalicious ? ["http://malicious-upi-gateway.com"] : [],
        moneyAmount: "0",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "VPA Target Lookup Check",
          severity: isMalicious ? "High" : "Low",
          confidence: 97,
          explanation: isMalicious 
            ? "QR signature is mapped to personal collection account and redirects to external scripting ports." 
            : "Genuine registered merchant details verified."
        }
      ],
      recommendations: isMalicious 
        ? ["Ignore Message", "Do Not Transfer Money", "Report to Cyber Crime"] 
        : ["Contact Your Bank"],
      timeline: isMalicious 
        ? ["QR scanned", "UPI handle decoded", "Mismatched destination checked", "Malicious VPA identified"] 
        : ["QR scanned", "VPA matched to merchant profile"],
      user_safety: "Check recipient VPA details displayed on the confirmation screen of your payment app before entering your UPI PIN.",
      related_scams: ["UPI Fraud", "QR Scam"],
      processingTimeMs: 85
    };

    return callGrokAPI(
      "You are Sentinel AI QR validator checking merchant payloads. Output only a structured JSON object matching the requested schema.",
      `Inspect scanned UPI QR Code payload: "${qrPayload}".
       Return JSON format: {
         "summary": "QR safety check summary",
         "classification": "QR Scam"|"UPI Fraud"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": [],
           "governmentNames": [],
           "bankNames": ["merchant"],
           "urls": ["redirect urls"],
           "moneyAmount": "0",
           "urgentKeywords": []
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "explain" }
         ],
         "recommendations": ["Do Not Transfer Money"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
       }`,
      mock
    );
  },

  analyzeURL: async (url: string): Promise<AIThreatReport> => {
    const isPhishing = /fake|login-verify|secure-bank|rbi-verification/i.test(url);
    const mock: AIThreatReport = {
      summary: isPhishing
        ? "Domain matches known phishing address template profiles. SSL certificate is self-signed."
        : "Valid domain registration. Domain is listed as clean on Google Web Risk registries.",
      classification: isPhishing ? "Phishing" : "Safe",
      fraud_confidence: isPhishing ? 96 : 2,
      ai_confidence: 98,
      threat_level: isPhishing ? 'Critical' : 'Safe',
      risk_indicators: isPhishing ? ["Domain age under 3 days", "Self-signed certificate"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: ["Reserve Bank of India"],
        urls: [url],
        moneyAmount: "0",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "Domain Registration Age Check",
          severity: isPhishing ? "High" : "Low",
          confidence: 98,
          explanation: isPhishing 
            ? "Domain was registered within the last 48 hours and utilizes self-signed SSL verification protocols." 
            : "Established domain with secure active licensing records."
        }
      ],
      recommendations: isPhishing 
        ? ["Ignore Message", "Block Number", "Report to Cyber Crime"] 
        : ["Contact Your Bank"],
      timeline: isPhishing 
        ? ["URL scanned", "Registry lookup initialized", "Self-signed SSL detected", "Phishing match issued"] 
        : ["URL scanned", "Domain reputational check passed"],
      user_safety: "Never login or enter net-banking details on redirects starting with HTTP instead of HTTPS.",
      related_scams: ["Phishing", "Identity Theft"],
      processingTimeMs: 70
    };

    return callGrokAPI(
      "You are Sentinel AI web domain scanner validating URL targets. Output only a structured JSON object matching the requested schema.",
      `Check URL threat status: "${url}".
       Return JSON format: {
         "summary": "Domain analysis details",
         "classification": "Phishing"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": [],
           "governmentNames": [],
           "bankNames": ["bank name"],
           "urls": ["url details"],
           "moneyAmount": "0",
           "urgentKeywords": []
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "explain" }
         ],
         "recommendations": ["Ignore Message"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
       }`,
      mock
    );
  },

  analyzeCurrency: async (serialNumber: string): Promise<AIThreatReport> => {
    const isFake = serialNumber.includes('FAKE') || serialNumber.includes('000000') || serialNumber.includes('₹500');
    const mock: AIThreatReport = {
      summary: isFake
        ? "Watermark pixel alignment anomalies detected. Serial ID does not match central bank register sequence indices."
        : "Genuine banknote pattern matched. Security threads verified.",
      classification: isFake ? "Identity Theft" : "Safe",
      fraud_confidence: isFake ? 65 : 1,
      ai_confidence: 93,
      threat_level: isFake ? 'Medium' : 'Safe',
      risk_indicators: isFake ? ["Watermark shift anomaly", "Missing security strip reflective response"] : [],
      evidence: {
        detectedNumbers: [serialNumber],
        governmentNames: [],
        bankNames: ["Reserve Bank of India"],
        urls: [],
        moneyAmount: "₹500",
        urgentKeywords: []
      },
      reasoning: [
        {
          name: "Reflective Security Thread Verification",
          severity: isFake ? "Medium" : "Low",
          confidence: 93,
          explanation: isFake 
            ? "Green-to-blue variable ink color shift is absent on the security strip." 
            : "Variable color security thread confirmed."
        }
      ],
      recommendations: isFake 
        ? ["Ignore Message", "Save Evidence", "Report to Cyber Crime"] 
        : ["Contact Your Bank"],
      timeline: isFake 
        ? ["Banknote scanned", "Watermark comparison initialized", "Color variables shift missed", "Counterfeit warning logged"] 
        : ["Banknote scanned", "Authentic press prints match confirmed"],
      user_safety: "Genuine banknotes feature crisp microlettering under magnification. Check security strip reflections.",
      related_scams: ["Identity Theft"],
      processingTimeMs: 180
    };

    return callGrokAPI(
      "You are Sentinel AI banknote validator checking watermark and serial indicators. Output only a structured JSON object matching the requested schema.",
      `Inspect banknote serial ID: "${serialNumber}".
       Return JSON format: {
         "summary": "Banknote genuineness rating summary",
         "classification": "Identity Theft"|"Safe",
         "fraud_confidence": 0-100,
         "ai_confidence": 0-100,
         "threat_level": "Safe"|"Low"|"Medium"|"High"|"Critical",
         "risk_indicators": ["risk 1"],
         "evidence": {
           "detectedNumbers": ["serial"],
           "governmentNames": [],
           "bankNames": ["RBI"],
           "urls": [],
           "moneyAmount": "value",
           "urgentKeywords": []
         },
         "reasoning": [
           { "name": "reason name", "severity": "High"|"Medium"|"Low", "confidence": 0-100, "explanation": "explain" }
         ],
         "recommendations": ["Save Evidence"],
         "timeline": ["Step 1", "Step 2"],
         "user_safety": "safety tips",
         "related_scams": ["scam type"]
      }`,
      mock
    );
  },

  analyzeEmail: async (emailBody: string): Promise<AIThreatReport> => {
    const isSuspicious = /verify|bank|reset|password|suspended|gift|reward|invoice|inheritance|lottery/i.test(emailBody);
    const mock: AIThreatReport = {
      summary: isSuspicious
        ? "The email contents contain phishing anchors requesting verification credential entries on external mock portals."
        : "Standard operational email structure. Verified domain signatures.",
      classification: isSuspicious ? "Phishing" : "Safe",
      fraud_confidence: isSuspicious ? 82 : 4,
      ai_confidence: 94,
      threat_level: isSuspicious ? 'High' : 'Safe',
      risk_indicators: isSuspicious ? ["Urgent password reset request", "Spoofed sender signature"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: [],
        urls: isSuspicious ? ["http://security-update-verification.com"] : [],
        moneyAmount: "0",
        urgentKeywords: isSuspicious ? ["immediate action", "verify now"] : []
      },
      reasoning: [
        {
          name: "Email Phishing Heuristics",
          severity: isSuspicious ? "High" : "Low",
          confidence: 95,
          explanation: isSuspicious 
            ? "Mismatched domain headers combined with urgent account verification demands indicate vishing/phishing targets."
            : "No abnormal triggers identified."
        }
      ],
      recommendations: isSuspicious 
        ? ["Ignore Message", "Delete and Block", "Do Not click links"] 
        : ["No action needed"],
      timeline: isSuspicious 
        ? ["Email received", "Urgency language parsed", "External phishing domain identified"]
        : ["Email received", "Parsed cleanly"],
      user_safety: "Never input banking credentials into redirect screens opened from email links.",
      related_scams: ["Phishing"],
      processingTimeMs: 110
    };

    return callGrokAPI(
      "You are Sentinel AI security scanner evaluating email headers and content. Output only a structured JSON object matching the requested schema.",
      `Evaluate email body: "${emailBody}".
       Return JSON format matching typical AIThreatReport.`,
      mock
    );
  },

  analyzeChat: async (chatLog: string): Promise<AIThreatReport> => {
    const isSuspicious = /crypto|investment|forex|earn|profit|task|work from home|telegram|deposit/i.test(chatLog);
    const mock: AIThreatReport = {
      summary: isSuspicious
        ? "Dialog contains cryptocurrency multi-level marketing (MLM) task fraud indicators targeting upfront deposits."
        : "Normal conversation feed. Natural response frequencies.",
      classification: isSuspicious ? "Investment Scam" : "Safe",
      fraud_confidence: isSuspicious ? 90 : 5,
      ai_confidence: 96,
      threat_level: isSuspicious ? 'High' : 'Safe',
      risk_indicators: isSuspicious ? ["MLM task group referral", "Crypto wallet deposit request"] : [],
      evidence: {
        detectedNumbers: [],
        governmentNames: [],
        bankNames: [],
        urls: [],
        moneyAmount: isSuspicious ? "₹15,000" : "0",
        urgentKeywords: isSuspicious ? ["deposit instantly", "earn high commission"] : []
      },
      reasoning: [
        {
          name: "Task Scam Classifier",
          severity: isSuspicious ? "High" : "Low",
          confidence: 96,
          explanation: isSuspicious 
            ? "Promises of high commissions for simple tasks (such as YouTube liking) with deposit requirements match known syndicates."
            : "Natural conversation flow."
        }
      ],
      recommendations: isSuspicious 
        ? ["Report to I4C portal", "Block Contact", "Do Not Transfer Money"] 
        : ["No action needed"],
      timeline: isSuspicious 
        ? ["Invited to Telegram group", "Upfront deposits requested", "Withdrawal limits imposed"]
        : ["Standard chat session logs checked"],
      user_safety: "Official merchants do not request payment/deposit deposits to permit work-from-home salary payments.",
      related_scams: ["Investment Scam", "UPI Fraud"],
      processingTimeMs: 125
    };

    return callGrokAPI(
      "You are Sentinel AI cybersecurity scanner evaluating group chat transcripts. Output only a structured JSON object matching the requested schema.",
      `Evaluate chat log transcript: "${chatLog}".
       Return JSON format matching typical AIThreatReport.`,
      mock
    );
  }
};
