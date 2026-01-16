import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import appointmentRoutes from './routes/appointment.routes';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

console.log("DEBUG: GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', appointmentRoutes);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
