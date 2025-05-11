import prisma from '~/.server/db';
import type { Route } from './+types/workspace';
import { Await, isRouteErrorResponse } from 'react-router';
import React from 'react';

export function meta({ error, data }: Route.MetaArgs) {
	if (error) {
		return [
			{ title: 'An error occurred :(' },
			{
				name: 'description',
				content: 'An error occurred while loading the workspace.',
			},
		];
	}
	return [
		{ title: data.theme },
		{
			name: 'description',
			content: `Explore the workspace for ${data.theme}.`,
		},
	];
}

export async function loader({ params }: Route.LoaderArgs) {
	return await prisma.workspace
		.findUnique({
			where: {
				id: params.id,
			},
			include: {
				resources: true,
				ideas: true,
			},
		})
		.then((workspace) => {
			if (!workspace) {
				throw new Response('Workspace not found', {
					status: 404,
					statusText: 'Not Found',
				});
			}
			return workspace;
		});
}

export default function Workspace({ loaderData }: Route.ComponentProps) {
	const { theme } = loaderData;
	return (
		<div className='p-16'>
			<h6 className='font-sans text-sm tracking-wider uppercase'>THEME</h6>
			<h1 className='text-6xl font-serif font-light italic'>{theme}</h1>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	console.log(error);
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
