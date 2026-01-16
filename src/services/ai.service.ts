import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AiService {
    private model = genAI.getGenerativeModel({ model: "gemini-pro" });

    async extractAppointmentDetails(text: string): Promise<{
        date_phrase: string | null;
        time_phrase: string | null;
        department: string | null;
        confidence: number;
        error?: string;
    }> {

        const prompt = `
      Extract the following details from the text below:
      1. Date phrase (e.g., "next Friday", "tomorrow", "12th Jan")
      2. Time phrase (e.g., "3pm", "14:00")
      3. Department (e.g., "dentist", "cardiology")
      
      Return the result as a JSON object with keys: "date_phrase", "time_phrase", "department".
      If information is missing, set the value to null.
      Also provide a confidence score (0-1) based on how clear the text is.

      Text: "${text}"
      
      Output JSON only.
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let textResponse = response.text();
            console.log("DEBUG: Raw AI Response:", textResponse);

            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                textResponse = textResponse.substring(firstBrace, lastBrace + 1);
            }

            textResponse = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();

            const json = JSON.parse(textResponse);

            return {
                date_phrase: json.date_phrase || null,
                time_phrase: json.time_phrase || null,
                department: json.department || null,
                confidence: json.confidence || 0.8 
            };
        } catch (error) {
            console.error('AI Extraction Error DETAILS:', error);
            
            return { date_phrase: null, time_phrase: null, department: null, confidence: 0, error: String(error) };
        }
    }
}

export default new AiService();
