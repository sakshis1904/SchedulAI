import * as Tesseract from 'tesseract.js';

export class OcrService {
    async extractText(imageBuffer: Buffer): Promise<{ raw_text: string; confidence: number }> {
        try {
            const result = await Tesseract.recognize(imageBuffer, 'eng');

            const text = result.data.text.trim();
            const confidence = result.data.confidence;

            return {
                raw_text: text,
                confidence: confidence,
            };
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Failed to process image');
        }
    }
}

export default new OcrService();
