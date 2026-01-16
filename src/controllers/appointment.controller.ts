import { Request, Response } from 'express';
import ocrService from '../services/ocr.service';
import aiService from '../services/ai.service';
import normalizationService from '../services/normalization.service';

export const scheduleAppointment = async (req: Request, res: Response) => {
    try {
        let textInput = req.body.text;
        let confidence = 1.0;

        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid file type. Only image files are allowed.',
                });
            }

            const ocrResult = await ocrService.extractText(req.file.buffer);

            if (!ocrResult.raw_text || ocrResult.raw_text.trim().length < 5) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Unable to extract readable text from image.',
                });
            }

            textInput = ocrResult.raw_text;
            confidence = ocrResult.confidence;
        }

        if (!textInput || typeof textInput !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'No valid input text provided.',
            });
        }

        const entities = await aiService.extractAppointmentDetails(textInput);

        if (!entities.department) {
            const lower = textInput.toLowerCase();
            if (lower.includes('dentist')) entities.department = 'dentist';
            else if (lower.includes('cardio')) entities.department = 'cardiology';
            else if (lower.includes('doctor')) entities.department = 'general';
            else if (lower.includes('physio')) entities.department = 'physiotherapy';
        }

        if (!entities.date_phrase) {
            const dateMatch = textInput.match(/(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)/i);
            if (dateMatch) entities.date_phrase = dateMatch[0];
        }

        if (!entities.time_phrase) {
            const timeMatch = textInput.match(/\b\d{1,2}(?::\d{2})?\s*(am|pm)?\b/i);
            if (timeMatch) entities.time_phrase = timeMatch[0];
        }

        const normalized = normalizationService.normalize(
            entities.date_phrase,
            entities.time_phrase
        );

        const missingFields: string[] = [];
        if (!entities.department) missingFields.push('department');
        if (!normalized.date) missingFields.push('date');
        if (!normalized.time) missingFields.push('time');

        if (missingFields.length > 0) {
            return res.json({
                status: 'needs_clarification',
                message: `Ambiguous or missing details: ${missingFields.join(', ')}`,
                extracted: {
                    department: entities.department,
                    date_phrase: entities.date_phrase,
                    time_phrase: entities.time_phrase,
                },
            });
        }

        return res.json({
            appointment: {
                department: entities.department,
                date: normalized.date,
                time: normalized.time,
                tz: normalized.tz,
            },
            status: 'ok',
        });
    } catch (error) {
        console.error('Controller Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};
