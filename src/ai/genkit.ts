// Minimal safe shim for "ai" used by flows.
// This avoids a hard dependency on provider SDKs (e.g. @genkit-ai/google-genai)
// during Next.js build. In production you can replace this with the real
// Genkit / provider integration.
export const ai = {
  /**
   * defineFlow accepts a config and an async handler and returns a function
   * that executes the handler. This matches how generated flows call
   * ai.defineFlow(...) and then invoke the returned flow function.
   *
   * Keep this shim very small to avoid bundler issues. Replace with a proper
   * Genkit client when integrating provider SDKs on the server.
   */
  defineFlow<TInput = any, TOutput = any>(
    _opts: { name?: string; inputSchema?: any; outputSchema?: any },
    handler: (input: TInput) => Promise<TOutput> | TOutput
  ) {
    const flowFn = async (input: TInput): Promise<TOutput> => {
      // Directly call handler. Real Genkit may include logging, tracing, etc.
      return await Promise.resolve(handler(input) as any);
    };

    // Expose metadata if needed by other code (kept minimal).
    (flowFn as any)._genkit = { name: _opts?.name ?? 'anonymous-flow' };

    return flowFn as unknown as (input: TInput) => Promise<TOutput>;
  },

  /**
   * definePrompt shim:
   * - Accepts options similar to genkit prompt definitions.
   * - Returns an async function which, when invoked with variables,
   *   returns { output: ... } to match how flows currently use it.
   *
   * This is a lightweight, deterministic fallback used during build
   * to avoid requiring external SDKs. Replace with real Genkit client
   * for production behavior.
   */
  definePrompt<TVars = any>(opts: { name?: string; prompt?: string; input?: any; output?: any }) {
    const promptText = opts?.prompt ?? '';

    const getComplementary = (baseColorRaw: string) => {
      const c = (baseColorRaw || '').toLowerCase();
      const map: Record<string, string[]> = {
        red: ['#00FFFF', '#FFD700', '#008080'],
        blue: ['#FFA500', '#FFD700', '#FF69B4'],
        green: ['#FF00FF', '#FFD700', '#00CED1'],
        black: ['#FFFFFF', '#CCCCCC', '#FFD700'],
        white: ['#000000', '#C0C0C0', '#FF4500'],
        yellow: ['#0000FF', '#800080', '#008080'],
        pink: ['#008080', '#000080', '#FFFF00'],
        purple: ['#FFD700', '#00FFCC', '#FFC0CB'],
      };
      return map[c] ?? ['#6495ED', '#FF7F50', '#F0E68C'];
    };

    const runner = async (vars?: TVars) => {
      try {
        const v: any = vars ?? {};
        // If this prompt resembles the suggest-outfit-colors flow, return structured output
        if ((opts.name && opts.name.toLowerCase().includes('suggest')) || opts.output) {
          const baseColor = v.baseColor ?? v.color ?? 'neutral';
          const complementaryColors = getComplementary(String(baseColor));
          const explanation = `These colors work with ${baseColor} by providing contrast and balance; try pairing them as accents or primary pieces depending on the outfit.`;
          return { output: { complementaryColors, explanation } };
        }

        // Generic fallback: return the prompt rendered (simple interpolation) under outputText
        let rendered = String(promptText);
        if (typeof promptText === 'string') {
          rendered = rendered.replace(/\{\{(\w+)\}\}/g, (_m, key) => {
            const val = (v as any)?.[key];
            return val != null ? String(val) : '';
          });
        }
        return { output: { text: rendered } };
      } catch (e) {
        return { output: {} };
      }
    };

    (runner as any)._genkit = { name: opts?.name ?? 'anonymous-prompt' };
    return runner as unknown as (vars?: TVars) => Promise<{ output?: any }>;
  },
};

export default ai;
