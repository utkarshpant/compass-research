import type { Idea, Workspace } from '@prisma/client';
import type { Route } from '../+types';
import { useFetcher } from 'react-router';
import prisma from '~/.server/db';
import { motion } from 'motion/react';
import useSound from 'use-sound';

export async function action({ request }: Route.ActionArgs) {
	const { workspaceId, ideaId } = await request.json();

	// find all ideas linked to the given WorkspaceId, and set them to false
	const linkedIdeas = await prisma.idea.findMany({
		where: {
			workspaces: {
				some: {
					id: workspaceId,
				},
			},
		},
		select: {
			id: true,
		},
	});

	// set all ideas with ID not equal to the given ideaId to false, and the given ideaId to true
	await prisma.idea.updateMany({
		where: {
			id: {
				in: linkedIdeas.map((idea) => idea.id),
			},
		},
		data: {
			primary: false,
		},
	});
	await prisma.idea.update({
		where: {
			id: ideaId,
		},
		data: {
			primary: true,
		},
	});
	return null;
}

export function Idea({
	idea,
	workspaceId,
	...props
}: {
	idea: Idea;
	workspaceId: Workspace['id'];
}) {
	const [playSelectionSound] = useSound('/button-6.wav');
	const fetcher = useFetcher({
		key: 'idea',
	});
	const selectedIdea = fetcher.data?.ideaId;
	return (
		<motion.button
			key={idea.id}
			initial={{ opacity: 0, scale: 0.7 }}
			animate={{ opacity: 1, scale: 1 }}
			className={`p-4 rounded-xl bg-cards dark:bg-stone-950 flex flex-col gap-1 w-full select-none ${
				idea.primary || selectedIdea === idea.id
					? 'border-amber-600 shadow-cards'
					: 'border-transparent dark:border-neutral-500/20 shadow-neutral-500/5'
			} border-2 cursor-pointer items-start`}
			onClick={() => {
				fetcher.submit(
					{
						workspaceId,
						ideaId: idea.id,
					},
					{
						method: 'POST',
						encType: 'application/json',
						action: 'api/workspace/update',
					}
				);
				playSelectionSound();
			}}
			layout
		>
			<span className='font-sans text-xs tracking-wider font-semibold text-olive dark:text-stone-500 uppercase'>
				Pathway
			</span>
			<span className='font-serif text-lg text-left'>{idea.name}</span>
		</motion.button>
	);
}
