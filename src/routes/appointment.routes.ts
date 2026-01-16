import { Router } from 'express';
import multer from 'multer';
import { scheduleAppointment } from '../controllers/appointment.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/schedule', upload.single('image'), scheduleAppointment);

export default router;
