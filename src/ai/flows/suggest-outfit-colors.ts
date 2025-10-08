'use server';

/**
 * @fileOverview Suggests complementary colors for a selected clothing item.
 *
 * - suggestOutfitColors - A function that suggests complementary colors.
 * - SuggestOutfitColorsInput - The input type for the suggestOutfitColors function.
 * - SuggestOutfitColorsOutput - The return type for the suggestOutfitColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOutfitColorsInputSchema = z.object({
  clothingItem: z.string().describe('The name of the clothing item.'),
  baseColor: z.string().describe('The base color of the clothing item (e.g., red, blue, green).'),
});
export type SuggestOutfitColorsInput = z.infer<typeof SuggestOutfitColorsInputSchema>;

const SuggestOutfitColorsOutputSchema = z.object({
  complementaryColors: z
    .array(z.string())
    .describe('An array of complementary colors for the clothing item.'),
  explanation: z
    .string()
    .describe('An explanation of why these colors are complementary.'),
});
export type SuggestOutfitColorsOutput = z.infer<typeof SuggestOutfitColorsOutputSchema>;

export async function suggestOutfitColors(input: SuggestOutfitColorsInput): Promise<SuggestOutfitColorsOutput> {
  return suggestOutfitColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitColorsPrompt',
  input: {schema: SuggestOutfitColorsInputSchema},
  output: {schema: SuggestOutfitColorsOutputSchema},
  prompt: `Suggest three complementary colors for a {{clothingItem}} that is {{baseColor}}. Also, provide a short explanation of why these colors are complementary and how they can be used in an outfit.

Output the complementary colors as a JSON array of strings, and the explanation as a string.

Make sure to set the output fields 'complementaryColors' and 'explanation'.`,
});

const suggestOutfitColorsFlow = ai.defineFlow(
  {
    name: 'suggestOutfitColorsFlow',
    inputSchema: SuggestOutfitColorsInputSchema,
    outputSchema: SuggestOutfitColorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
