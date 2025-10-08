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
};

export default ai;
