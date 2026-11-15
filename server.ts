import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  applyLocalAIAssistantCommand,
  compileProjectToCode,
  isImageReplaceCommand,
} from './src/utils/designEngine';
import { DesignElement, DesignProject, Language } from './src/types/design';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

function isRealKey(val?: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return (
    trimmed.length > 8 &&
    trimmed !== 'MY_GEMINI_API_KEY' &&
    trimmed !== 'YOUR_DEEPSEEK_API_KEY'
  );
}

app.get('/api/status', (_req, res) => {
  const deepseekConfigured = isRealKey(process.env.DEEPSEEK_API_KEY);
  const geminiConfigured = isRealKey(process.env.GEMINI_API_KEY);

  res.json({
    ok: true,
    deepseekConfigured,
    deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    geminiConfigured,
    activeEngine: deepseekConfigured
      ? 'DeepSeek API (Connected)'
      : 'Local Deterministic Compiler (DeepSeek API key not set)',
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    const project = req.body?.project as DesignProject | undefined;
    if (!project || !Array.isArray(project.pages)) {
      res.status(400).json({ error: 'Invalid DesignProject payload.' });
      return;
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const deepseekConfigured = isRealKey(deepseekKey);
    const deepseekUrl =
      process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // Always produce the deterministic baseline first so we have a guaranteed valid fallback
    const baseline = compileProjectToCode(
      project,
      'local-compiler',
      'DeepSeek API is not connected (DEEPSEEK_API_KEY not set in .env). Compiled locally using SITECRAFT Deterministic AST Compiler.',
      false
    );

    if (deepseekConfigured) {
      try {
        const systemPrompt = `You are the SITECRAFT AI Website Compiler powered by DeepSeek.
Receive a structured JSON design document and return a JSON object with keys: "html", "css", "js", "react".
Preserve all pages, texts, images, exact colors, typography, spacing, and responsive layout.`;

        const response = await fetch(deepseekUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekKey!.trim()}`,
          },
          body: JSON.stringify({
            model: deepseekModel,
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Compile this SITECRAFT DesignProject JSON into production HTML/CSS/JS/React JSON:\n${JSON.stringify(
                  project
                )}`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawText = data.choices?.[0]?.message?.content;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.html && parsed.css) {
              res.json({
                html: parsed.html,
                css: parsed.css,
                js: parsed.js || baseline.js,
                react: parsed.react || baseline.react,
                generatedAt: new Date().toISOString(),
                provider: 'deepseek',
                providerMessage: `Compiled via DeepSeek API (${deepseekModel})`,
                deepseekConfigured: true,
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn('DeepSeek API call failed, falling back to local AST compiler:', err);
      }
    }

    res.json(baseline);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: 'Failed to compile project.' });
  }
});

app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { element, prompt, lang = 'ru' } = req.body as {
      element?: DesignElement;
      prompt?: string;
      lang?: Language;
    };

    if (!element || !prompt) {
      res.status(400).json({ error: 'Element and prompt are required.' });
      return;
    }

    // If the user explicitly asked to replace/change an image, never fabricate a nonexistent path;
    // return requiresImageSelection: true so the Studio UI prompts the user to select/upload a real asset.
    if (isImageReplaceCommand(prompt)) {
      const imgResult = applyLocalAIAssistantCommand(element, prompt, lang);
      res.json({
        updated: imgResult.updated,
        summary: imgResult.summary,
        requiresImageSelection: true,
        provider: 'local-engine',
        deepseekConfigured: false,
      });
      return;
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const deepseekConfigured = isRealKey(deepseekKey);
    const geminiConfigured = isRealKey(process.env.GEMINI_API_KEY);

    // 1. Try DeepSeek API if configured
    if (deepseekConfigured) {
      try {
        const deepseekUrl =
          process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
        const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

        const response = await fetch(deepseekUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekKey!.trim()}`,
          },
          body: JSON.stringify({
            model: deepseekModel,
            messages: [
              {
                role: 'system',
                content:
                  'You are the SITECRAFT Visual Design Assistant. Modify the provided DesignElement JSON according to the user instruction. Return JSON with { "updated": DesignElement, "summary": string }.',
              },
              {
                role: 'user',
                content: `Instruction: ${prompt}\nCurrent Element JSON:\n${JSON.stringify(
                  element
                )}`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed.updated && parsed.updated.id === element.id) {
              res.json({
                updated: parsed.updated,
                summary: parsed.summary || 'Modified via DeepSeek AI.',
                provider: 'deepseek',
                deepseekConfigured: true,
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn('DeepSeek assistant error, falling back:', err);
      }
    }

    // 2. Try Server-Side Gemini API if GEMINI_API_KEY is available
    if (geminiConfigured) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const localPreview = applyLocalAIAssistantCommand(element, prompt, lang);
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `You are a senior UI designer modifying a design element in SITECRAFT.
User command: "${prompt}"
Preferred summary language: "${lang === 'ru' ? 'Russian' : 'English'}"
Current element name: "${element.name}", type: "${element.type}", content: "${element.metadata.content}", background: "${element.styles.background}", color: "${element.styles.color}".
Provide a concise 1-sentence summary of the design enhancement applied in ${lang === 'ru' ? 'Russian' : 'English'}.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
              },
            },
          },
        });

        const parsed = JSON.parse((response.text ?? '{}').trim());
        if (parsed.summary) {
          res.json({
            updated: localPreview.updated,
            summary: parsed.summary,
            provider: 'gemini',
            deepseekConfigured: false,
          });
          return;
        }
      } catch {
        // Fall through to deterministic local engine
      }
    }

    // 3. Deterministic Local AST Transformation Engine
    const localResult = applyLocalAIAssistantCommand(element, prompt, lang);
    res.json({
      updated: localResult.updated,
      summary: localResult.summary,
      requiresImageSelection: localResult.requiresImageSelection,
      provider: 'local-engine',
      deepseekConfigured: false,
    });
  } catch (error) {
    console.error('Error in /api/ai-assistant:', error);
    res.status(500).json({ error: 'Failed to process AI Assistant command.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SITECRAFT server running on http://localhost:${PORT}`);
  });
}

startServer();
