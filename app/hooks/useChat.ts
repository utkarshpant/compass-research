import type { Workspace } from '@prisma/client';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';

export type ChatMessage = {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export function useChat({
	workspaceId,
	initialMessages,
}: {
	workspaceId?: Workspace['id'];
	initialMessages?: ChatMessage[];
}) {
	const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// this ref will hold the reference to the abort controller for the last request;
	const eventSourceRef = useRef<EventSource | null>(null);

	// the function to send the message to the server;
	// every instance of useChat will be bound to the same workspaceId;
	const send = useCallback(
		async (message: string) => {
			if (!message) return;
			const userMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'user',
				content: message,
			};
			setMessages((prevMessages) => [...prevMessages, userMessage]);
			setIsLoading(true);
			setError(null);

			// close a connection to the existing event source;
			eventSourceRef.current?.close();

			// define what happens on every message;
			const assistantMessage: ChatMessage = {
				id: '',
				role: 'assistant',
				content: '',
			};
			setMessages((prevMessages) => [...prevMessages, assistantMessage]);

			// actually kick off the POST request;
			const response = await fetch(`/api/workspace/${workspaceId}/conversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userMessage),
			});
			await response.json().then((data) => {
				eventSourceRef.current = new EventSource(
					`/api/workspace/${workspaceId}/conversation?jobId=${data?.job.id}`,
					{
						withCredentials: false,
					}
				);

				eventSourceRef.current.addEventListener('meta', (event) => {
					// update assistant message ID with the ID of the message;
					setMessages((messages) =>
						messages.map((message) =>
							message.id === '' && message.role === 'assistant'
								? { ...message, id: event.data }
								: message
						)
					);
					assistantMessage.id = event.data;
				});

				eventSourceRef.current.addEventListener('done', (event) => {
					setIsLoading(false);
					eventSourceRef.current?.close();
					return;
				});

				eventSourceRef.current.addEventListener('message', (event) => {
					setMessages((messages) =>
						messages.map((message) => {
							if (message.id !== assistantMessage.id) {
								return message;
							} else {
								return { ...message, content: message.content + event.data };
							}
						})
					);
				});
				// error handling;
				eventSourceRef.current?.addEventListener('error', (event) => {
					setIsLoading(false);
					// log the error;
					console.error('Error occurred while processing the request:', event);
					setError(new Error('An error occurred while processing your request.'));
					eventSourceRef.current?.close();
				});
			});
		},
		[workspaceId]
	);

	const abort = () => {
		eventSourceRef.current?.close();
		setIsLoading(false);
	};
	return { messages, isLoading, error, send, abort };
}
