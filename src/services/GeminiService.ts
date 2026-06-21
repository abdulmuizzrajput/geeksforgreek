import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HealthDocument } from './clinicalSamples';

// Local fallbacks for health metrics when running without active API key
export interface HealthIndicator {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'borderline' | 'warning' | 'critical';
  explanation: string;
}

export interface PodcastTurn {
  speaker: 'Dr. Sarah' | 'Alex';
  text: string;
}

// Fallback Metrics for Default Samples
export const getFallbackIndicators = (docs: HealthDocument[]): HealthIndicator[] => {
  const indicators: HealthIndicator[] = [];
  const activeIds = docs.map(d => d.id);

  if (activeIds.includes('sample-cbc-metabolic')) {
    indicators.push(
      {
        name: 'LDL Cholesterol',
        value: '165',
        unit: 'mg/dL',
        normalRange: '< 100',
        status: 'critical',
        explanation: 'Elevated bad cholesterol. Increases cardiovascular risk by building up in artery walls.'
      },
      {
        name: 'Fasting Glucose',
        value: '104',
        unit: 'mg/dL',
        normalRange: '70 - 99',
        status: 'borderline',
        explanation: 'Slightly elevated fasting blood sugar, indicating borderline glucose regulation.'
      },
      {
        name: 'Hemoglobin',
        value: '12.1',
        unit: 'g/dL',
        normalRange: '13.5 - 17.5',
        status: 'warning',
        explanation: 'Lower than normal hemoglobin, indicating mild microcytic anemia.'
      },
      {
        name: 'HbA1c',
        value: '5.8',
        unit: '%',
        normalRange: '< 5.7%',
        status: 'borderline',
        explanation: 'Slightly elevated average glucose level over 3 months, indicating prediabetes.'
      },
      {
        name: 'eGFR',
        value: '85',
        unit: 'mL/min/1.73m²',
        normalRange: '> 90',
        status: 'warning',
        explanation: 'Mildly decreased kidney filtration rate; requires monitoring.'
      }
    );
  }

  if (activeIds.includes('sample-endocrine-thyroid')) {
    indicators.push(
      {
        name: 'TSH (Thyroid Stim. Hormone)',
        value: '5.25',
        unit: 'uIU/mL',
        normalRange: '0.45 - 4.50',
        status: 'critical',
        explanation: 'Elevated TSH indicates the pituitary gland is telling the thyroid to work harder.'
      },
      {
        name: 'Free T4',
        value: '0.82',
        unit: 'ng/dL',
        normalRange: '0.82 - 1.77',
        status: 'borderline',
        explanation: 'Borderline low active thyroid hormone level, suggesting subclinical hypothyroidism.'
      }
    );
  }

  // General default if nothing else matches or empty
  if (indicators.length === 0) {
    indicators.push({
      name: 'Welcome Health Marker',
      value: '--',
      unit: '',
      normalRange: 'N/A',
      status: 'normal',
      explanation: 'Upload your own blood report or select one of the built-in clinical samples in the sidebar to populate insights.'
    });
  }

  return indicators;
};

// Fallback Podcast dialogue script
export const FALLBACK_PODCAST: PodcastTurn[] = [
  {
    speaker: 'Dr. Sarah',
    text: "Welcome back to the SoftingyPulse Health Digest. Today we are looking at Robert Harrison's medical files, specifically his recent blood report and cardiovascular consultation summary. Alex, what stands out to you first?"
  },
  {
    speaker: 'Alex',
    text: "Thanks, Dr. Sarah. Looking at this, Robert has a few numbers highlighted. First, his total cholesterol is 245, and his LDL, the so-called 'bad cholesterol', is sitting at 165. That is well above the target of 100, right?"
  },
  {
    speaker: 'Dr. Sarah',
    text: "Exactly. In cardiometabolic health, an LDL of 165 is a call to action, especially since he's already taking Atorvastatin 20 milligrams. That is why Dr. Vance titrated his dosage up to 40 milligrams in the consultation note to bring that number down."
  },
  {
    speaker: 'Alex',
    text: "I see. And what about his glucose levels? His fasting glucose is 104, and his HbA1c is 5.8 percent. It says 'prediabetic' next to them. Is that a major concern?"
  },
  {
    speaker: 'Dr. Sarah',
    text: "It is an early warning system. A normal HbA1c is under 5.7. Robert's 5.8 indicates his body is starting to resist insulin. It is not full-blown diabetes yet, meaning it can be reversed or managed with lifestyle changes: less refined sugar, more fibers, and exercise."
  },
  {
    speaker: 'Alex',
    text: "Right, Dr. Vance recommended 150 minutes of moderate exercise a week. Now, what about his thyroid results? It shows a high TSH of 5.25 and a borderline low Free T4. What does that signify?"
  },
  {
    speaker: 'Dr. Sarah',
    text: "This represents Subclinical Hypothyroidism. TSH is released by the brain to stimulate the thyroid. When the thyroid gland is sluggish, TSH goes up to force it to work. Robert reported symptoms like feeling cold, skin dryness, and gaining 6 pounds, which fits this pattern perfectly. That is why he was started on low-dose Levothyroxine, 25 micrograms."
  },
  {
    speaker: 'Alex',
    text: "That explains a lot. So, the plan is to retest in 8 weeks to check how the medication is working. It's fascinating how all these documents paint a complete picture of his metabolic health."
  },
  {
    speaker: 'Dr. Sarah',
    text: "Precisely. By combining lab assays with clinical summaries, we get an integrated view. That's all for today's digest. Remember to consult your physician before making any adjustments to your medication."
  }
];

export class GeminiService {
  private static getAIInstance(apiKey: string) {
    return new GoogleGenerativeAI(apiKey);
  }

  // Validate the API key by running a tiny completion
  public static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const ai = this.getAIInstance(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      await model.generateContent('ping');
      return true;
    } catch (e) {
      console.error('Error validating API key:', e);
      return false;
    }
  }

  // Generate chatbot response grounded in medical documents
  public static async generateChatResponse(
    apiKey: string,
    modelName: string,
    activeDocs: HealthDocument[],
    chatHistory: { role: 'user' | 'model'; content: string }[],
    message: string
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('API key is required.');
    }

    const ai = this.getAIInstance(apiKey);
    const model = ai.getGenerativeModel({ model: modelName });

    // Format sources as context
    const sourcesContext = activeDocs.map((doc, idx) => {
      return `[Source ${idx + 1}] Title: ${doc.title}\nType: ${doc.type}\nContent:\n${doc.content}\n---`;
    }).join('\n\n');

    const systemPrompt = `You are SoftingyPulse LM, an advanced, empathetic AI medical analyst and healthcare document assistant.
Your goal is to help users analyze and understand their health records (blood tests, lab values, clinical summaries, prescriptions, doctor notes).

You must ground your answers strictly and exclusively in the clinical source documents provided.
Provide clear, simple, layperson-friendly translations of medical concepts while preserving clinical accuracy.
When explaining lab markers, reference what is normal and how the user's values compare.

IMPORTANT INSTRUCTION FOR CITATIONS:
Always cite which source you got your information from using inline markdown badges like "[Source 1]" or "[Source 2]". Include the source title when citing for the first time.

STRICT AGENTIC GROUNDING CONSTRAINT:
If the user asks questions that cannot be answered using the provided sources, or asks about general topics, external medical conditions, or advice not present in the active documents, you must strictly refuse to answer. You must respond exactly with:
"I am sorry, but as SoftingyPulse, I am strictly limited to answering questions based on your uploaded source documents. I cannot find any reference to this topic in the active records."
Do not attempt to answer using general knowledge or provide any outside information.

Every response MUST conclude with a brief divider and this exact disclaimer in a small, muted block:
"Disclaimer: SoftingyPulse LM is an educational AI assistant and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."`;

    // Map history to Google GenAI format
    const contents = [
      {
        role: 'user',
        parts: [{ text: `Clinical Sources:\n${sourcesContext}\n\nSystem Prompt:\n${systemPrompt}` }]
      },
      ...chatHistory.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    try {
      const result = await model.generateContent({ contents });
      return result.response.text() || "No response generated.";
    } catch (e: any) {
      console.error('Error generating chat response:', e);
      throw new Error(e.message || 'Error executing Gemini API. Please check your key.');
    }
  }

  // Extract structured health metrics using Gemini JSON Mode
  public static async extractHealthIndicators(
    apiKey: string,
    modelName: string,
    activeDocs: HealthDocument[]
  ): Promise<HealthIndicator[]> {
    if (!apiKey) {
      return getFallbackIndicators(activeDocs);
    }

    try {
      const ai = this.getAIInstance(apiKey);
      const model = ai.getGenerativeModel({ model: modelName });

      const sourcesContext = activeDocs.map((doc, idx) => {
        return `Source ${idx + 1}: ${doc.title}\nContent:\n${doc.content}`;
      }).join('\n\n');

      const prompt = `Review the following medical documents and extract key physical, chemical, or biological health markers (e.g. cholesterol, hemoglobin, fasting glucose, TSH, blood pressure, etc.).
For each key marker found, output a JSON object containing:
- name: The clean name of the indicator (e.g. "LDL Cholesterol" or "TSH")
- value: The numerical value or reading (e.g. "165" or "138/86")
- unit: The measurement unit (e.g. "mg/dL", "%", "mmHg")
- normalRange: The normal reference range (e.g. "< 100" or "< 130/80")
- status: One of "normal", "borderline", "warning", or "critical" based on how far it is from the normal range
- explanation: A concise, one-sentence explanation in patient-friendly terms of what this reading means.

Format your output as a raw JSON array matching this typescript interface:
interface HealthIndicator {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'borderline' | 'warning' | 'critical';
  explanation: string;
}

Do not include markdown code block styling, just the raw JSON array.
Documents:
${sourcesContext}`;

      const result = await model.generateContent(prompt);
      let text = result.response.text() || '';
      
      // Clean JSON if the model included markdown blocks
      if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return JSON.parse(text) as HealthIndicator[];
    } catch (e) {
      console.error('Error extracting health indicators, using fallback:', e);
      return getFallbackIndicators(activeDocs);
    }
  }

  // Generate Podcast Dialogue Script using Gemini
  public static async generatePodcastBrief(
    apiKey: string,
    modelName: string,
    activeDocs: HealthDocument[]
  ): Promise<PodcastTurn[]> {
    if (!apiKey) {
      return FALLBACK_PODCAST;
    }

    try {
      const ai = this.getAIInstance(apiKey);
      const model = ai.getGenerativeModel({ model: modelName });

      const sourcesContext = activeDocs.map((doc, idx) => {
        return `Source ${idx + 1}: ${doc.title}\nContent:\n${doc.content}`;
      }).join('\n\n');

      const prompt = `Create a simulated podcast audio briefing script between two hosts:
- Host 1: "Dr. Sarah", a clinical communicator who explains the medical science.
- Host 2: "Alex", a friendly co-host and patient advocate who asks questions, summarizes, and adds clarity.

The topic is an review of the uploaded medical documents. The tone should be engaging, informative, easy to understand, and reassuring.
Break down what blood test results are abnormal, what the doctors recommendations mean, and what positive lifestyle shifts the patient can make.

Output the result as a raw JSON array matching this format:
[
  { "speaker": "Dr. Sarah", "text": "speech content..." },
  { "speaker": "Alex", "text": "speech content..." }
]

Keep it to about 8 to 12 turns. Do not include markdown code blocks, just raw JSON.

Documents:
${sourcesContext}`;

      const result = await model.generateContent(prompt);
      let text = result.response.text() || '';

      if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return JSON.parse(text) as PodcastTurn[];
    } catch (e) {
      console.error('Error generating podcast, using fallback:', e);
      return FALLBACK_PODCAST;
    }
  }
}
