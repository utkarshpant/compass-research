import { type Workspace, type Idea, ReadRecommendation } from '@prisma/client';
import OpenAI from 'openai';
import { z } from 'zod';

export const openai = new OpenAI();

/**
 * Generates a prompt for summarizing a document and providing a read recommendation
 * based on the user's research context and intent.
 *
 * @param first - The first chunk of text extracted from the document.
 * @param last - The last chunk of text extracted from the document.
 * @param workspace - An object containing the user's research context, including:
 *   - `theme`: The research question or theme.
 *   - `type`: The user's intent (e.g., "research" or "learn").
 *   - `ideas`: An array of ideas related to the research, where one is marked as primary.
 *
 * @returns A string prompt to guide the research assistant in summarizing the document
 * and determining a read recommendation for the user.
 */
export function summary_prompt(
	first: string,
	last: string,
	workspace: Pick<Workspace, 'theme' | 'type'> & { ideas: Array<Idea> }
) {
	return `You are a research assistant, assisting the user in their research on a given "research question". The user has found a paper, article or other document that they think is relevant to their research, and need your help to:
	1. Summarize (in about 200 words) the document using the first and last chunks of text extracted from the document,
	2. Determine a "read recommendation" for the user, based on the summary you have provided. You can recommend that the user read the document, skim it, or skip it entirely.
	
	The following information is provided to give you more context on the user's research question, intent (a user may want to "research" the topic or "learn" more about it - think researcher vs. student), and current focus-area pertaining to the research question.
	
    Some more guidelines for your responses:
    1. Please *do not* use Markdown to format the summary or read recommendation!
    2. Please be very objective while considering your recommendation to read, skim, or skip the document. Consider the user's research question, intent, and current focus area while making your recommendation. It is possible that the document is not relevant to the user's research question, and in that case, you should recommend skipping it.
	
    ---
	Research question: ${workspace.theme}
	Research intent: ${workspace.type}
	Current focus area: ${workspace.ideas.filter((idea) => idea.primary)[0].name}
    First and last chunks of text extracted from the document:
    ---
    ${first}
    ${last}
	---
	`;
}

export const summarySchema = z.object({
	summary: z.string(),
	readRecommendation: z.enum([
		ReadRecommendation.READ,
		ReadRecommendation.SKIM,
		ReadRecommendation.SKIP,
	]),
});
