import type { Route } from './+types/workspace';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { isRouteErrorResponse } from 'react-router';
import { z } from 'zod';
import prisma from '~/.server/db';

const openAI = new OpenAI();

export const IdeaSchema = z.object({
	ideas: z.array(
		z.object({
			path: z.string(),
			description: z.string().nullable(),
		})
	),
});

export function loader({}: Route.LoaderArgs) {
	throw new Response('Sorry, this route expects only POST requests and you sent a GET request.', {
		status: 405,
	});
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const question = formData.get('question') as string;

	const response = await openAI.responses.parse({
		model: 'gpt-4o-mini',
		input: [
			{
				role: 'system',
				content: `Functioning as a research assistant, your task is to help the user organize their research effort by understanding the "research question", and suggesting UP TO 3 "ideas" that the user can explore. An "idea" is a "way of looking at the problem statement," and may include:
				- potential causes of the problem,
				- potential solutions to the problem,
				- concepts, theories, or other ideas that may be relevant to the problem statement.

				For example, if the research question is "What are the best ways to extract value from small datasets for classification tasks?" - you might suggest:
				- Data centric augmentation techniques and synthetic data generation,
				- Algorithmic bias-variance adaptations for small data,
				- Cross-Domain Transfer and Semi-Supervised Learning for Small Data Classification.

				Please keep your suggestions concise and to the point; use the \`description\` field to provide a brief explanation of the pathway IF REQUIRED. Additionally, please DO NOT include numbering in your suggestions - they will be presented as cards to the user, which the user will then be able to select from.`,
			},
			{
				role: 'user',
				content: `The user provided the following research question: ${question}`,
			},
		],
		text: {
			format: zodTextFormat(IdeaSchema, 'idea'),
		},
	});

	const ideasToCreate = response.output_parsed?.ideas.map((idea, index) => ({
		name: idea.path,
		primary: index === 0 ? true : false,
		id: crypto.randomUUID(),
	}));

	// generate a response using OpenAI API
	const workspace = await prisma.workspace.create({
		data: {
			type: 'LEARN',
			ideas: {
				create: ideasToCreate,
			},
			theme: question,
		},
	});

	return {
		workspaceId: workspace.id,
	};
	// const searchParams = new URLSearchParams();
	// searchParams.set('workspace', '123');
	// return redirect(`/?${searchParams}`, {
	// 	status: 302,
	// });
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error)) {
		return (
			<div className='p-12'>
				<h1 className='font-medium text-4xl'>{error.status}</h1>
				<h2>{error.data}</h2>
			</div>
		);
	} else if (error instanceof Error) {
		return (
			<div className='p-12'>
				<h1 className='font-medium text-4xl'>Error</h1>
				<h2>{error.message}</h2>
			</div>
		);
	}
}
