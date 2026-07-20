import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/services/auth';
import { extractTextFromFile } from '@/lib/services/extractor';
import { extractIndicatorsFromText, lookupThreatIndicator, recordThreatIndicator } from '@/lib/services/intelligence_server';
import { evaluateThreatReport } from '@/lib/services/engine';
import { recordAnalysisResult } from '@/lib/services/stats';
import { AIThreatReport } from '@/lib/services/ai';

const SYSTEM_PROMPT = `
You are Sentinel AI Security Copilot, a professional cybersecurity investigator and real-time defense orchestrator.
Your role is to analyze inputs (text, chats, logs, file extractions) for cyber threats, social engineering, and fraud.

GUIDELINES:
- Assess caller identities, known scams (Digital Arrest, UPI fraud, KYC blocks, courier scams, task scams), remote access requests, and psychological coercion.
- Evaluate threat levels, risk indicators, and provide action recommendations.
- Keep responses focused ONLY on security. Reject unrelated prompts.
- Format responses in clear Markdown bullet points, structured timelines, and brief summaries. Do NOT use code blocks unless demonstrating an email/text structure.
`;

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, files, liveProtectionMode, conversationId } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const convoUuid = conversationId || 'd0cb6bbd-467b-449e-ba67-0c7f8a7e0a00';
    const lastUserMsg = messages[messages.length - 1]?.text || '';

    // 1. Process and extract text from attached files
    let fileExtractionsText = '';
    const processedFiles: string[] = [];

    if (files && Array.isArray(files)) {
      for (const file of files) {
        try {
          const rawBase64 = file.data;
          const cleanBase64 = rawBase64.includes(',') ? rawBase64.split(',')[1] : rawBase64;
          const buffer = Buffer.from(cleanBase64, 'base64');
          const text = await extractTextFromFile(buffer, file.name);
          fileExtractionsText += `\n[Extracted from uploaded file ${file.name}]:\n${text}\n`;
          processedFiles.push(file.name);
        } catch (fileErr: any) {
          console.error(`Error processing file ${file.name}:`, fileErr.message);
        }
      }
    }

    const fullContentToAnalyze = `${lastUserMsg}\n${fileExtractionsText}`;

    // 2. Extract and check Threat Intelligence indicators
    const indicators = extractIndicatorsFromText(fullContentToAnalyze);
    let intelContext = '';
    const foundBadIndicators: string[] = [];

    // Check phone numbers, URLs, UPIs
    const allIndicatorsToCheck = [...indicators.phones, ...indicators.urls, ...indicators.upis, ...indicators.wallets];
    for (const item of allIndicatorsToCheck) {
      const match = await lookupThreatIndicator(item);
      if (match.found) {
        foundBadIndicators.push(`${item} (${match.category}, Reputation Index: ${match.reputation})`);
        intelContext += `\nWARNING: Found matching threat registry entity: ${item}. Identified category: ${match.category}, previously flagged in ${match.reputation} investigations.`;
      }
    }

    // Save user's message & file notes to chat history audit logs
    await supabase.from('ai_chat_history').insert({
      conversation_id: convoUuid,
      user_id: user.id,
      role: 'user',
      message: lastUserMsg + (processedFiles.length > 0 ? ` [Attached: ${processedFiles.join(', ')}]` : '')
    });

    // 3. Structured Groq Analysis to extract fraud confidence factors
    const grokApiKey = process.env.GROK_API_KEY;
    let copilotMessage = '';
    let analysisScore = 0;
    let isEmergency = false;
    let threatLevel = 'Safe';

    if (!grokApiKey || grokApiKey === 'PLACEHOLDER_GROK_API_KEY') {
      copilotMessage = `[Demonstration Mode] Grok API is not active. Analyzed input text details: "${lastUserMsg.slice(0, 100)}". Safeguards active.`;
      if (lastUserMsg.toLowerCase().includes('otp') || lastUserMsg.toLowerCase().includes('cbi') || lastUserMsg.toLowerCase().includes('arrest')) {
        analysisScore = 88;
        threatLevel = 'Critical';
        isEmergency = true;
      }
    } else {
      // Build full payload messages for Groq
      const payloadMessages = [
        { role: 'system', content: SYSTEM_PROMPT + `\n[AUTHENTICATED USER WORKSPACE CONTEXT]${intelContext}` },
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: fullContentToAnalyze }
      ];

      const isGroq = grokApiKey.startsWith('gsk_');
      const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.xai.com/v1/chat/completions';
      const model = isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: payloadMessages,
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        copilotMessage = data?.choices?.[0]?.message?.content || 'Unparsed copilot output.';
      } else {
        copilotMessage = 'Central Scam Prevention analyzer returned connectivity error. Proceeding with safety evaluation.';
      }

      // Perform real-time fraud index calculations on the extracted indicators
      const allExtractedWords = fullContentToAnalyze.toLowerCase();
      const detectedIndicators: string[] = [];
      if (allExtractedWords.includes('otp') || allExtractedWords.includes('pin') || allExtractedWords.includes('password')) detectedIndicators.push('otp request');
      if (allExtractedWords.includes('cbi') || allExtractedWords.includes('police') || allExtractedWords.includes('arrest') || allExtractedWords.includes('court')) detectedIndicators.push('government impersonation');
      if (allExtractedWords.includes('money') || allExtractedWords.includes('transfer') || allExtractedWords.includes('payment') || allExtractedWords.includes('upi')) detectedIndicators.push('money request');
      if (allExtractedWords.includes('immediate') || allExtractedWords.includes('block') || allExtractedWords.includes('verify')) detectedIndicators.push('urgency');
      if (allExtractedWords.includes('http') || allExtractedWords.includes('link') || allExtractedWords.includes('.in') || allExtractedWords.includes('.net')) detectedIndicators.push('malicious url');

      const mockReport: AIThreatReport = {
        summary: copilotMessage,
        classification: detectedIndicators.includes('government impersonation') ? 'Digital Arrest' : 'Phishing',
        fraud_confidence: detectedIndicators.length * 20,
        ai_confidence: 90,
        threat_level: 'Safe',
        risk_indicators: detectedIndicators,
        evidence: {
          detectedNumbers: indicators.phones,
          governmentNames: [],
          bankNames: [],
          urls: indicators.urls,
          moneyAmount: '0',
          urgentKeywords: []
        },
        reasoning: [],
        recommendations: ['Hang up immediately', 'Report online'],
        timeline: [],
        user_safety: 'Keep PIN confidential.',
        related_scams: []
      };

      const scoreReport = evaluateThreatReport(mockReport);
      analysisScore = scoreReport.fraud_confidence;
      threatLevel = scoreReport.threat_level;
      isEmergency = analysisScore >= 85;

      // 4. Record new intelligence patterns
      for (const ph of indicators.phones) {
        await recordThreatIndicator(ph, detectedIndicators.includes('government impersonation') ? 'Digital Arrest Call' : 'Scam Caller');
      }
      for (const ur of indicators.urls) {
        await recordThreatIndicator(ur, 'Phishing Domain');
      }
      for (const upi of indicators.upis) {
        await recordThreatIndicator(upi, 'Unverified UPI Wallet');
      }
    }

    // 5. Record new scan/analysis request if any risk is identified
    if (analysisScore > 10) {
      await recordAnalysisResult(
        user.id,
        'chat',
        lastUserMsg,
        {
          summary: copilotMessage.slice(0, 200),
          classification: analysisScore >= 70 ? 'Extortion Coercion' : 'Phishing Scan',
          fraud_confidence: analysisScore,
          ai_confidence: 92,
          threat_level: threatLevel,
          risk_indicators: foundBadIndicators,
          evidence: { detectedNumbers: indicators.phones, urls: indicators.urls },
          recommendations: ['Do Not comply', 'Block and report'],
          timeline: ['User input analyzed', 'Indicators recorded'],
          user_safety: 'Do not share OTP pins.'
        }
      );
    }

    // Save assistant response to chat history logs
    await supabase.from('ai_chat_history').insert({
      conversation_id: convoUuid,
      user_id: user.id,
      role: 'assistant',
      message: copilotMessage
    });

    return NextResponse.json({
      message: copilotMessage,
      fraudConfidence: analysisScore,
      threatLevel: threatLevel,
      isEmergency: isEmergency,
      indicatorsFound: foundBadIndicators
    });

  } catch (err: any) {
    console.error('Copilot POST router execution failure:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
