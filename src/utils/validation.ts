import { z } from 'zod';

export const ScheduleRequestSchema = z.object({
    text: z.string().optional(),
});

export const AppointmentResponseSchema = z.object({
    appointment: z.object({
        department: z.string(),
        date: z.string(), 
        time: z.string(), 
        tz: z.string(),
    }),
    status: z.literal('ok'),
});

export const ClarificationResponseSchema = z.object({
    status: z.literal('needs_clarification'),
    message: z.string(),
});
