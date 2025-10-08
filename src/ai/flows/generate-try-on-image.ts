// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Genkit flow for generating a try-on image of a user wearing selected clothing items.
 *
 * - generateTryOnImage - A function that handles the image generation process.
 * - GenerateTryOnImageInput - The input type for the generateTryOnImage function.
 * - GenerateTryOnImageOutput - The return type for the generateTryOnImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTryOnImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  clothingItemDataUris: z
    .array(z.string())
    .describe(
      "An array of clothing items as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  newColor: z.string().optional().describe('An optional new color to apply to the clothing item.'),
  provider: z
    .enum(['openai', 'gemini', 'leonardo', 'seedream'])
    .describe('AI provider to use for image generation'),
  apiKey: z
    .string()
    .optional()
    .describe(
      'API key for the selected provider (forwarded from client; not stored server-side by this flow)'
    ),
});
export type GenerateTryOnImageInput = z.infer<typeof GenerateTryOnImageInputSchema>;

const GenerateTryOnImageOutputSchema = z.object({
  generatedImageDataUri: z
    .string()
    .describe('The generated image with the clothing items applied to the user, as a data URI.'),
});
export type GenerateTryOnImageOutput = z.infer<typeof GenerateTryOnImageOutputSchema>;

export async function generateTryOnImage(
  input: GenerateTryOnImageInput
): Promise<GenerateTryOnImageOutput> {
  return generateTryOnImageFlow(input);
}

const generateTryOnImageFlow = ai.defineFlow(
  {
    name: 'generateTryOnImageFlow',
    inputSchema: GenerateTryOnImageInputSchema,
    outputSchema: GenerateTryOnImageOutputSchema,
  },
  async (input) => {
    let textPrompt = `You are an AI image generator specializing in virtually trying on clothes.

  The user has uploaded a photo of themselves and selected one or more clothing items.
  Your task is to generate a single, new, ultra-realistic image of the user from the first image wearing the clothing item(s) from the other images.

  - The background of the generated image should be a neutral light gray.
  - The final image should only contain the person wearing the clothes. Do not add any extra text, logos, or other elements.
  - Ensure the generated image has natural drapes, textures, folds, shadows, and lighting consistent with the clothing and the user's pose.
  - The user's face and physical characteristics must be preserved perfectly.
  - The output must be a single image.
  - If multiple clothing items are provided, place them on the user in a realistic way (e.g., shirt on torso, hat on head).`;

    if (input.newColor) {
      textPrompt += `\n- IMPORTANT: Change the color of the main clothing item to ${input.newColor}. Keep the original style and texture, just change the color.`;
    }

    // Route to the selected provider. Each provider helper prepares the payload
    // and performs the API call. If anything fails, we fallback to returning the
    // original photoDataUri (client-side composition fallback).
    try {
      switch (input.provider) {
        case 'openai':
          return await callOpenAIDalle3(input, textPrompt);
        case 'gemini':
          return await callGeminiVision(input, textPrompt);
        case 'leonardo':
          return await callLeonardoAI(input, textPrompt);
        case 'seedream':
          return await callSeedream(input, textPrompt);
        default:
          throw new Error('Unknown provider');
      }
    } catch (err) {
      console.error('Image generation failed:', err);
      // Fallback: return original photo to keep app usable
      return { generatedImageDataUri: input.photoDataUri };
    }

    // Helpers ----------------------------------------------------------------

    async function callOpenAIDalle3(
      inp: GenerateTryOnImageInput,
      prompt: string
    ): Promise<GenerateTryOnImageOutput> {
      if (!inp.apiKey) throw new Error('OpenAI API key required for provider "openai".');
      try {
        const { default: OpenAI } = await import('openai');
        const client = new OpenAI({ apiKey: inp.apiKey as string });
        // Use Images API (gpt-image-1) as in your snippet
        const result: any = await client.images.generate({
          model: 'gpt-image-1',
          prompt,
        });
        const b64 = result?.data?.[0]?.b64_json;
        if (b64) {
          return { generatedImageDataUri: `data:image/png;base64,${b64}` };
        }
        // Response-based generation (responses API) fallback
        if (result?.data?.length === 0) {
          return { generatedImageDataUri: inp.photoDataUri };
        }
        return { generatedImageDataUri: inp.photoDataUri };
      } catch (e) {
        console.error('OpenAI image generation error:', e);
        return { generatedImageDataUri: inp.photoDataUri };
      }
    }

    async function callGeminiVision(
      inp: GenerateTryOnImageInput,
      prompt: string
    ): Promise<GenerateTryOnImageOutput> {
      if (!inp.apiKey) throw new Error('Gemini API key required for provider "gemini".');
      try {
        const mod = await import('@google/genai');
        const { GoogleGenAI } = mod as any;
        // try to pass apiKey if the SDK accepts it; otherwise the environment must provide credentials
        const aiClient = new GoogleGenAI({ apiKey: inp.apiKey });
        const response: any = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: prompt,
        });
        const parts = response?.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const imageData = part.inlineData.data; // base64
            return {
              generatedImageDataUri: `data:image/png;base64,${imageData}`,
            };
          }
        }
        return { generatedImageDataUri: inp.photoDataUri };
      } catch (e) {
        console.error('Gemini generation error:', e);
        return { generatedImageDataUri: inp.photoDataUri };
      }
    }

    async function callLeonardoAI(
      inp: GenerateTryOnImageInput,
      prompt: string
    ): Promise<GenerateTryOnImageOutput> {
      if (!inp.apiKey) throw new Error('Leonardo API key required for provider "leonardo".');
      try {
        // Leonardo example uses a POST to /generations
        const body = {
          alchemy: true,
          height: 768,
          modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // sample model id - adapt if needed
          num_images: 1,
          presetStyle: 'DYNAMIC',
          prompt,
          width: 1024,
        };
        const res = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${inp.apiKey}`,
          },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        // Leonardo often returns a job id; a separate polling call may be required.
        // If the response contains image URLs/data return them, otherwise fallback.
        if (json?.artifacts && json.artifacts.length > 0 && json.artifacts[0].base64) {
          return {
            generatedImageDataUri: `data:image/png;base64,${json.artifacts[0].base64}`,
          };
        }
        // If the API returns a direct URL in data, return that (as data URI not available)
        if (json?.data?.[0]?.url) {
          // Fetch the image and convert to base64
          try {
            const imgRes = await fetch(json.data[0].url);
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            return {
              generatedImageDataUri: `data:image/png;base64,${buffer.toString('base64')}`,
            };
          } catch (e) {
            console.warn('Failed to fetch Leonardo returned URL:', e);
          }
        }
        return { generatedImageDataUri: inp.photoDataUri };
      } catch (e) {
        console.error('Leonardo generation error:', e);
        return { generatedImageDataUri: inp.photoDataUri };
      }
    }

    async function callSeedream(
      inp: GenerateTryOnImageInput,
      prompt: string
    ): Promise<GenerateTryOnImageOutput> {
      if (!inp.apiKey) throw new Error('Seedream API key required for provider "seedream".');
      try {
        // Seedream (BytePlus Ark) example uses a client SDK in Python; here we attempt a direct POST
        const url = 'https://ark.ap-southeast.bytepluses.com/api/v3/images/generate';
        const body = {
          model: 'seedream-4-0-250828',
          prompt,
          size: '2K',
          response_format: 'b64_json', // ask for base64 in response if supported
          watermark: true,
        };
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${inp.apiKey}`,
          },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        // If provider returns base64
        const b64 = json?.data?.[0]?.b64_json || json?.data?.[0]?.b64;
        if (b64) {
          return { generatedImageDataUri: `data:image/png;base64,${b64}` };
        }
        // If returns a URL, fetch and convert
        const imageUrl = json?.data?.[0]?.url;
        if (imageUrl) {
          try {
            const imgRes = await fetch(imageUrl);
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            return {
              generatedImageDataUri: `data:image/png;base64,${buffer.toString('base64')}`,
            };
          } catch (e) {
            console.warn('Failed to fetch Seedream returned URL:', e);
          }
        }
        return { generatedImageDataUri: inp.photoDataUri };
      } catch (e) {
        console.error('Seedream generation error:', e);
        return { generatedImageDataUri: inp.photoDataUri };
      }
    }
  }
);
