import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function start() {
  const app = express();
  app.use(express.json());

  // ── AI Mentor endpoint ─────────────────────────────────────
  app.post('/api/mentor', async (req, res) => {
    const { message, context } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'message required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.json({
        reply:
          'دستیار AI هنوز پیکربندی نشده. کلید GEMINI_API_KEY را در فایل .env قرار دهید.\n\n' +
          'در همین حال می‌توانید از دستور help در ترمینال استفاده کنید.',
      });
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `تو یک منتور شبکه و زیرساخت IT هستی که به زبان فارسی پاسخ می‌دهی.
کاربر در حال یادگیری شبکه با پلتفرم NetworkLearn است.
پاسخ‌هایت کوتاه، دقیق و آموزشی باشد. جواب نهایی کوئست را لو نده؛ فقط سرنخ بده.

${context ? `زمینه فعلی: ${context}\n` : ''}
سوال کاربر: ${message}`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const reply = result.text || 'پاسخی دریافت نشد.';
      res.json({ reply });
    } catch (err: any) {
      console.error('Gemini error:', err?.message || err);
      res.status(500).json({ error: 'خطا در ارتباط با AI', detail: err?.message });
    }
  });

  // ── Health ─────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, name: 'NetworkLearn', version: '1.0.0' });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n🌐 NetworkLearn running at http://localhost:${PORT}\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
