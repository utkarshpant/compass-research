import type { Route } from './+types/index';
import { NumberedHeading } from '../components/NumberedHeading';
import UserInput from '../components/UserInput';
import { useFetcher, useSearchParams } from 'react-router';
import type { Idea, Workspace } from '@prisma/client';
import { useEffect } from 'react';
import prisma from '~/.server/db';
import { Idea as IdeaComponent } from './api/update-workspace';
import { AnimatePresence } from 'motion/react';
import FileUploadDrawer from '~/components/FileUploadDrawer';
import { useSound } from 'use-sound';
import Badge from '~/components/Badge';

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: data ? data.theme : 'Compass for Literature Reviews' },
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
			ideas: true,
			resources: true,
		},
	});
	return workspace;
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const workspace = loaderData;
	const fetcher = useFetcher({
		key: 'workspace.theme',
	});
	const { data }: { data: { workspaceId: Workspace['id']; ideas: Idea[] } } = fetcher;
	const [searchParams, setSearchParams] = useSearchParams();
	const [playSuccessSound] = useSound('/success.wav', {
		volume: 0.3,
	});

	useEffect(() => {
		if (fetcher.state === 'idle' && data && !searchParams.has('workspaceId')) {
			playSuccessSound();
			setSearchParams({ workspace: data.workspaceId });
		}
	}, [fetcher]);

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
					action='/api/workspace'
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
				<AnimatePresence>
					{sortedIdeas ? (
						<div className='flex flex-col gap-4'>
							{fetcher.state === 'loading' ||
							fetcher.state === 'submitting' ||
							fetcher.data ||
							(sortedIdeas && sortedIdeas.length > 0) ? (
								<Badge
									key='badge'
									text={
										fetcher.state !== 'idle'
											? 'Working'
											: 'We created a Workspace for you'
									}
								/>
							) : null}
							{sortedIdeas.length > 0 ? (
								<div className='flex flex-col lg:flex-row gap-4 lg:gap-8 my-4 w-full'>
									{sortedIdeas?.map((idea) => (
										<IdeaComponent
											idea={idea}
											key={idea.id}
											workspaceId={data?.workspaceId ?? workspace?.id}
										/>
									))}
								</div>
							) : null}
						</div>
					) : null}
				</AnimatePresence>

				<NumberedHeading
					index={3}
					title='Drag and drop papers here as you discover them.'
					variant='small'
				/>
				{workspace && workspace.resources.length > 0 ? (
					<div className='flex flex-col lg:flex-row gap-4 lg:gap-8 my-4 w-full'>
						<AnimatePresence>
							{workspace.resources.map((resource) => (
								<span>
									{resource.originalName} - {resource.type}
								</span>
							))}
						</AnimatePresence>
					</div>
				) : null}
				<FileUploadDrawer />
				<NumberedHeading
					index={4}
					title="You're all set - start exploring and asking questions!"
					variant='small'
				/>
				{/* <Outlet /> */}
			</div>
		</>
	);
}
