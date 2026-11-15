import {
  applyLocalAIAssistantCommand,
  compileProjectToCode,
  isImageReplaceCommand,
} from './src/utils/designEngine';
import { DesignElement, DesignProject, Language } from './src/types/design';

export interface CloudflareEnv {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_API_URL?: string;
  DEEPSEEK_MODEL?: string;
  GEMINI_API_KEY?: string;
}

function isRealKey(val?: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return (
    trimmed.length > 8 &&
    trimmed !== 'MY_GEMINI_API_KEY' &&
    trimmed !== 'YOUR_DEEPSEEK_API_KEY'
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/status' && request.method === 'GET') {
      const deepseekConfigured = isRealKey(env.DEEPSEEK_API_KEY);
      const geminiConfigured = isRealKey(env.GEMINI_API_KEY);
      return jsonResponse({
        ok: true,
        deepseekConfigured,
        deepseekModel: env.DEEPSEEK_MODEL || 'deepseek-chat',
        geminiConfigured,
        activeEngine: deepseekConfigured
          ? 'DeepSeek API (Connected)'
          : 'Local Deterministic Compiler (DeepSeek API key not set)',
      });
    }

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { project?: DesignProject };
        const project = body?.project;
        if (!project || !Array.isArray(project.pages)) {
          return jsonResponse({ error: 'Invalid DesignProject payload.' }, 400);
        }

        const baseline = compileProjectToCode(
          project,
          'local-compiler',
          'DeepSeek API is not connected (DEEPSEEK_API_KEY not set). Compiled locally using SITECRAFT Deterministic AST Compiler.',
          false
        );

        if (isRealKey(env.DEEPSEEK_API_KEY)) {
          try {
            const deepseekUrl =
              env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
            const deepseekModel = env.DEEPSEEK_MODEL || 'deepseek-chat';
            const response = await fetch(deepseekUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.DEEPSEEK_API_KEY!.trim()}`,
              },
              body: JSON.stringify({
                model: deepseekModel,
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are the SITECRAFT AI Website Compiler powered by DeepSeek. Return a JSON object with keys: "html", "css", "js", "react".',
                  },
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
                  return jsonResponse({
                    html: parsed.html,
                    css: parsed.css,
                    js: parsed.js || baseline.js,
                    react: parsed.react || baseline.react,
                    generatedAt: new Date().toISOString(),
                    provider: 'deepseek',
                    providerMessage: `Compiled via DeepSeek API (${deepseekModel})`,
                    deepseekConfigured: true,
                  });
                }
              }
            }
          } catch {
            // Fall back to deterministic compiler
          }
        }

        return jsonResponse(baseline);
      } catch {
        return jsonResponse({ error: 'Failed to compile project.' }, 500);
      }
    }

    if (url.pathname === '/api/ai-assistant' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          element?: DesignElement;
          prompt?: string;
          lang?: Language;
        };
        const { element, prompt, lang = 'ru' } = body;
        if (!element || !prompt) {
          return jsonResponse({ error: 'Element and prompt are required.' }, 400);
        }

        if (isImageReplaceCommand(prompt)) {
          const imgResult = applyLocalAIAssistantCommand(element, prompt, lang);
          return jsonResponse({
            updated: imgResult.updated,
            summary: imgResult.summary,
            requiresImageSelection: true,
            provider: 'local-engine',
            deepseekConfigured: false,
          });
        }

        const localResult = applyLocalAIAssistantCommand(element, prompt, lang);
        return jsonResponse({
          updated: localResult.updated,
          summary: localResult.summary,
          requiresImageSelection: localResult.requiresImageSelection,
          provider: 'local-engine',
          deepseekConfigured: false,
        });
      } catch {
        return jsonResponse({ error: 'Failed to process AI Assistant command.' }, 500);
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
