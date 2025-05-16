import type { ChatMessage } from '~/hooks/useChat';
import { registerQueue } from '../queues';
import prisma from '../db';
import type { Workspace, Idea } from '@prisma/client';
import { redis } from '../utils/redis';
import { openai } from '../utils/openai';

type MessageJobData = {
	workspaceId: string;
	userMessage: ChatMessage;
};

export type MessageJobProgressUpdate = {
	event: string;
	data: string;
};

export const messageQueue = registerQueue<MessageJobData>('message', async (job) => {
	const { workspaceId, userMessage } = job.data;
	const workspace: (Workspace & { ideas: Idea[] }) | null = (await redis.exists(workspaceId))
		? JSON.parse((await redis.get(workspaceId)) ?? '{}')
		: await prisma.workspace.findUnique({
				where: {
					id: workspaceId,
				},
				include: {
					ideas: true,
				},
		  });
	if (!redis.exists(workspaceId)) {
		await redis.set(workspaceId, JSON.stringify(workspace));
	}

	const systemPrompt = `You are a helpful assistant. You are helping the user with their research on ${
		workspace?.theme
	}. The user is trying to ${
		workspace?.type === 'LEARN'
			? 'learn more about the topic as a student'
			: 'research the topic as a researcher familiar with the field'
	}, and they are currently focused on the following ideas: ${workspace?.ideas
		.map((idea) => idea.name + (idea.primary ? ' (primarily)' : ''))
		.join(', ')}.
                        
	This system prompt is provided to give you more context on the user's intent and will be provided to you with every request, which will also include the last 15 messages in the conversation. As far as possible, please try to consider every request from the user in terms of the "theme" of the conversation, the broad "ideas" or lines of inquiry that the user is considering, and finally, the line of inquiry they are *primarily* focused on at the moment.`;

	const systemMessage: ChatMessage = {
		id: crypto.randomUUID(),
		role: 'system',
		content: systemPrompt,
	};

	// grab the last 15 messages from redis;
	let messages: ChatMessage[] = (await redis.lrange(`workspace:${workspaceId}`, -15, -1)).map(
		(message) => JSON.parse(message)
	);

	// generate message chain starting with system prompt and ending with user message;
	messages = [systemMessage, ...messages, userMessage];
	const response = await openai.chat.completions.create({
		messages: [systemMessage, ...messages, userMessage],
		model: 'gpt-4o-mini',
		stream: true,
	});

	const assistantResponse: ChatMessage = {
		id: crypto.randomUUID(),
		role: 'assistant',
		content: '',
	};

	// send the message ID to the client;
	await job.updateProgress({
		event: 'meta',
		data: assistantResponse.id,
	});

	for await (const chunk of response) {
		await job.updateProgress({
			event: 'message',
			data: chunk.choices[0].delta.content || '',
		});
		assistantResponse.content += chunk.choices[0].delta.content || '';
	}
	await job.updateProgress({
		event: 'done',
		data: '[DONE]',
	});
	// save the message to redis;
	redis.rpush(
		`workspace:${workspaceId}`,
		JSON.stringify(userMessage),
		JSON.stringify(assistantResponse)
	);

	// persist system message to the database
	prisma.message
		.create({
			data: {
				id: assistantResponse.id,
				content: assistantResponse.content,
				role: 'system',
				workspace: {
					connect: {
						id: workspaceId,
					},
				},
			},
		})
		.then(() => {
			console.log('System message saved to database');
		});
});
