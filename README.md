# SchedulAI - AI-Powered Appointment Scheduler

SchedulAI is a backend service that extracts appointment details from text or images using OCR (Tesseract.js) and AI (Gemini), normalizes the data, and returns a structured JSON response.

## Features
- **OCR Support**: Extracts text from uploaded images.
- **AI Extraction**: Uses Google Gemini to find date, time, and department.
- **Normalization**: Converts natural language dates (e.g., "next Friday") to ISO format (`YYYY-MM-DD`) in `Asia/Kolkata` timezone.
- **Guardrails**: Validates input and output ensuring no ambiguity.

## Tech Stack
- **Runtime**: Node.js, Express.js
- **Language**: TypeScript
- **AI**: Google Gemini API
- **OCR**: Tesseract.js
- **Utils**: Day.js, Zod, Multer

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Build**
   ```bash
   npm run build
   ```

## Running the Server

- **Development**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

## API Usage

### `POST /api/schedule`

**Option 1: JSON Input (Text)**
```bash
curl -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" \
  -d '{"text": "I need a dentist appointment next Friday at 3pm"}'
```

**Option 2: Image Input (Multipart)**
```bash
curl -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/appointment_card.jpg"
```

### Response Format
**Success:**
```json
{
  "appointment": {
    "department": "dentist",
    "date": "2023-10-27",
    "time": "15:00",
    "tz": "Asia/Kolkata"
  },
  "status": "ok"
}
```

**Ambiguous Input:**
```json
{
  "status": "needs_clarification",
  "message": "Ambiguous or missing details: time",
  "extracted": { ... }
}
```

## Project Structure
- `src/controllers`: Request handlers
- `src/services`: Business logic (OCR, AI, Normalization)
- `src/routes`: API definitions
- `src/utils`: Helpers (Validation, Error Handling)
