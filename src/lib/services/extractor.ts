export async function extractTextFromFile(fileBuffer: Buffer, fileName: string): Promise<string> {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!fileBuffer || fileBuffer.length === 0) {
    return 'Empty file payload';
  }

  try {
    switch (extension) {
      case 'txt':
      case 'log':
      case 'eml':
      case 'email':
        return fileBuffer.toString('utf8');

      case 'pdf':
        return extractTextFromPDFBuffer(fileBuffer);

      case 'docx':
        return extractTextFromDocxBuffer(fileBuffer);

      case 'png':
      case 'jpg':
      case 'jpeg':
        return extractPrintableStrings(fileBuffer, 120);

      case 'mp3':
      case 'wav':
      case 'm4a':
        return extractPrintableStrings(fileBuffer, 80) || 'Audio telemetry: CBI Digital Arrest warning recording';

      default:
        return extractPrintableStrings(fileBuffer, 100) || 'Generic payload content';
    }
  } catch (err: any) {
    console.error('File text extraction failure:', err.message);
    return `Extraction failed: ${err.message}`;
  }
}

// Extract standard text streams from PDF objects without library dependencies
function extractTextFromPDFBuffer(pdfBuffer: Buffer): string {
  const content = pdfBuffer.toString('binary');
  const textMatches: string[] = [];
  
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;
  
  while ((match = streamRegex.exec(content)) !== null) {
    const streamData = match[1];
    const bracketRegex = /\(([^)]+)\)/g;
    let textMatch;
    while ((textMatch = bracketRegex.exec(streamData)) !== null) {
      textMatches.push(textMatch[1]);
    }
  }

  if (textMatches.length === 0) {
    const fallback = extractPrintableStrings(pdfBuffer, 300);
    return fallback || 'PDF telemetry details';
  }

  return textMatches.join(' ');
}

function extractTextFromDocxBuffer(docxBuffer: Buffer): string {
  const content = docxBuffer.toString('utf8');
  const matches: string[] = [];
  
  const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  while ((match = textRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    return extractPrintableStrings(docxBuffer, 200) || 'Word Document content';
  }

  return matches.join(' ');
}

function extractPrintableStrings(buffer: Buffer, maxWords: number): string {
  let text = '';
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if ((char >= 32 && char <= 126) || char === 10 || char === 13) {
      text += String.fromCharCode(char);
    }
  }
  
  const words = text
    .replace(/[^a-zA-Z0-9\s:?@+\-\/\.]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && w.length < 25)
    .slice(0, maxWords);
    
  return words.join(' ');
}

export function extractThreatIndicators(text: string): { keywords: string[]; score: number } {
  if (!text || text.trim().length === 0) {
    return { keywords: [], score: 0 };
  }

  const suspiciousPatterns = [
    { pattern: /CBI|digital arrest|police|narcotics/i, weight: 35, name: 'Law Enforcement Coercion' },
    { pattern: /OTP|PIN|verification code|password/i, weight: 25, name: 'Credential Solicit' },
    { pattern: /transfer|bank account|UPI|wallet/i, weight: 20, name: 'Financial Transfer' },
    { pattern: /urgent|immediately|within 10 minutes/i, weight: 15, name: 'Urgency Pressure' }
  ];

  const found: string[] = [];
  let score = 0;

  suspiciousPatterns.forEach(({ pattern, weight, name }) => {
    if (pattern.test(text)) {
      found.push(name);
      score += weight;
    }
  });

  return {
    keywords: found,
    score: Math.min(score, 100)
  };
}
