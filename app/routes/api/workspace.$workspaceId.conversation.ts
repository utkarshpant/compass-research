import { eventStream } from 'remix-utils/sse/server';
import type { Route } from './+types/workspace.$workspaceId.conversation';
import { type ChatMessage } from '~/hooks/useChat';
import { messageQueue, type MessageJobProgressUpdate } from '~/.server/messages';
import prisma from '~/.server/db';

export async function loader({ request }: Route.ActionArgs) {
	const jobId = new URL(request.url).searchParams.get('jobId');
	if (!jobId) {
		return null;
	}
	try {
		const messageJob = await messageQueue.getJob(jobId);
		if (!messageJob) {
			return new Response('Job not found', { status: 404 });
		}
		return eventStream(
			request.signal,
			function setup(send) {
				messageQueue.events.addListener('progress', onProgress);
				function onProgress({
					jobId,
					data: update,
				}: {
					jobId: string;
					data: MessageJobProgressUpdate;
				}) {
					if (jobId !== messageJob?.id) return;
					// send update as it is;
					send(update);
					// if the job is done, remove the listener;
					if (update.event === 'done') {
						messageQueue.events.removeListener('progress', onProgress);
					}
				}

				return function cleanup() {
					messageQueue.events.removeListener('progress', onProgress);
				};
			},
			{
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
				},
			}
		);
	} catch (e) {
		console.error('An error occured while fetching the job', e);
		return new Response('Internal Server Error', { status: 500 });
	}
}

export async function action({ request, params }: Route.ActionArgs) {
	try {
		const userMessage: ChatMessage = await request.json();
		const workspaceId = params.workspaceId;

		const messageJob = await messageQueue.add('message', {
			workspaceId,
			userMessage,
		});

		prisma.message.create({
			data: {
				id: userMessage.id,
				role: 'user',
				content: userMessage.content,
				workspace: {
					connect: {
						id: workspaceId,
					},
				},
			},
		}).then(() => {
			console.log('User message saved to database');
		});

		return {
			job: {
				id: messageJob.id,
			},
		};
	} catch (err) {
		console.error('An error occured while creating a message job', err);
		return new Response('Internal Server Error', { status: 500 });
	}
}
