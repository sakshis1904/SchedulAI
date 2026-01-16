import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Kolkata';

export class NormalizationService {
    normalize(datePhrase: string | null, timePhrase: string | null): {
        date: string | null;
        time: string | null;
        tz: string
    } {
        const tz = TIMEZONE;
        if (!datePhrase && !timePhrase) {
            return { date: null, time: null, tz };
        }

        let parsedDate = dayjs();

        let dateStr: string | null = null;
        let timeStr: string | null = null;

        if (datePhrase) {
            const lowerDp = datePhrase.toLowerCase();
            if (lowerDp.includes('today')) {
                dateStr = dayjs().format('YYYY-MM-DD');
            } else if (lowerDp.includes('tomorrow')) {
                dateStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
            } else {
                const attempted = dayjs(datePhrase);
                if (attempted.isValid()) {
                    dateStr = attempted.format('YYYY-MM-DD');
                } else {
                    if (lowerDp.includes('next try')) { /* ... */ }
                
                    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    for (let i = 0; i < 7; i++) {
                        if (lowerDp.includes(days[i])) {
                            let d = dayjs();
                            if (lowerDp.includes('next')) {
                                d = d.add(1, 'week'); 
                            }
                            while (d.day() !== i) {
                                d = d.add(1, 'day');
                            }
                            dateStr = d.format('YYYY-MM-DD');
                            break;
                        }
                    }
                }
            }
        }

        if (timePhrase) {
            const tp = timePhrase.replace(/\s+/g, '').toLowerCase();
            let t = dayjs(`2000-01-01 ${tp}`); 
            const pmMatch = tp.match(/(\d+)(?::(\d+))?pm/);
            const amMatch = tp.match(/(\d+)(?::(\d+))?am/);

            if (pmMatch) {
                let h = parseInt(pmMatch[1]);
                const m = pmMatch[2] ? parseInt(pmMatch[2]) : 0;
                if (h < 12) h += 12;
                timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            } else if (amMatch) {
                let h = parseInt(amMatch[1]);
                const m = amMatch[2] ? parseInt(amMatch[2]) : 0;
                if (h === 12) h = 0;
                timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            } else {
                if (t.isValid()) {
                    timeStr = t.format('HH:mm');
                }
            }
        }

        return {
            date: dateStr,
            time: timeStr,
            tz
        };
    }
}

export default new NormalizationService();
