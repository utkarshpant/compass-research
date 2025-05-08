import type { Route } from './+types/index';
import { NumberedHeading } from '../components/NumberedHeading';
import UserInput from '../components/UserInput';
import { useFetcher, useSearchParams } from 'react-router';
import type { Idea, Workspace } from '@prisma/client';
import { useEffect, useState } from 'react';
import prisma from '~/.server/db';
import { Idea as IdeaComponent } from './api/workspace.update';
import { AnimatePresence, motion } from 'motion/react';
import FileUploadDrawer from '~/components/FileUploadDrawer';
import { parseFormData } from '@mjackson/form-data-parser';
import { uploadHandler } from '~/.server/fileUploadHandler';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'Compass for Literature Reviews' },
		{
			name: 'description',
			content:
				'Compass is a research management tool specifically made for Literature Reviews.',
		},
	];
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const workspaceId = url.searchParams.get('workspace');
	if (!workspaceId) {
		return null;
	}
	const workspace = await prisma.workspace.findUnique({
		where: {
			id: workspaceId,
		},
		include: {
			ideas: {
				select: {
					id: true,
					name: true,
					primary: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	});
	return workspace;
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await parseFormData(request, uploadHandler);
	const file = formData.get('compass-pdf') as File;
	const workspaceId = formData.get('workspace') as string;
	prisma.resource.create({
		data: {
			name: file.name,
			type: 'FILE',
			embeddingStatus: 'PENDING',
			workspaces: {
				connect: {
					id: workspaceId,
				},
			},
		},
	});
	return { file };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const workspace = loaderData;
	const fetcher = useFetcher({
		key: 'workspace.theme',
	});
	const { data }: { data: { workspaceId: Workspace['id']; ideas: Idea[] } } = fetcher;
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		if (data && !searchParams.has('workspaceId')) {
			setSearchParams({ workspace: data.workspaceId });
		}
	}, [data, searchParams]);

	const sortedIdeas =
		workspace && workspace.ideas.length > 0
			? workspace?.ideas.sort((a, b) => {
					if (a.id < b.id) {
						return -1;
					}
					if (a.id > b.id) {
						return 1;
					}
					return 0;
			  })
			: [];

	return (
		<>
			<div className='px-48 py-24'>
				<p className='font-serif text-xl leading-loose'>
					Compass is a research assistant tool designed to help you{' '}
					<em>
						organize your initial thought process, explore early ideas, and get through
						literature review faster.
					</em>
					Whenever you're starting a new literature survey, here's how you can use Compass
					to help you along:
				</p>

				<NumberedHeading
					index={1}
					title='Start with a research question and pick an initial pathway.'
					variant='small'
				/>
				<fetcher.Form
					action='/api/conversation'
					method='POST'
				>
					<UserInput
						name='question'
						disabled={Boolean(workspace && workspace.id)}
						defaultValue={workspace?.theme ?? ''}
					/>
				</fetcher.Form>
				<NumberedHeading
					index={2}
					title='Select an idea to focus on initially.'
					variant='small'
				/>
				{workspace || data ? (
					<div className='flex flex-col gap-4'>
						<span className='rounded-full text-xs font-medium uppercase tracking-wider bg-amber-300 dark:bg-amber-500 w-fit px-4 py-2'>
							We created a Workspace for you
						</span>
						<div className='flex flex-col lg:flex-row gap-4 lg:gap-8 my-4 w-full'>
							<AnimatePresence>
								{sortedIdeas?.map((idea) => (
									<IdeaComponent
										idea={idea}
										key={idea.id}
										workspaceId={workspace.id}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				) : null}

				<NumberedHeading
					index={3}
					title='Drag and drop papers here as you discover them.'
					variant='small'
				/>
				<FileUploadDrawer />

				{/* <Outlet /> */}
			</div>
		</>
	);
}
