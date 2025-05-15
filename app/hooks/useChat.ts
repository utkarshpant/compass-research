import type { Workspace } from '@prisma/client';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useEventSource } from 'remix-utils/sse/react';

export type ChatMessage = {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export function useChat(workspaceId: Workspace['id']) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
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
			// set up a new connection for this request;
			eventSourceRef.current = new EventSource(`/api/workspace/${workspaceId}/conversation`, {
				withCredentials: false,
			});

			// define what happens on every message;
            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '',
            };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
			eventSourceRef.current.onmessage = (event) => {
                console.log(event);
				if (event.data === '[DONE]') {
					setIsLoading(false);
					eventSourceRef.current?.close();
					return;
				}
				setMessages((messages) =>
					messages.map((message) => {
						if (message.id !== assistantMessage.id) {
							return message;
						} else {
							return { ...message, content: message.content + " " + event.data };
						}
					})
				);
			};

			// error handling;
			eventSourceRef.current.onerror = (event) => {
				setIsLoading(false);
				setError(new Error('An error occurred while processing your request.'));
				eventSourceRef.current?.close();
			};

            console.log(eventSourceRef.current);

			// actually kick off the POST request;
			const response = await fetch(`/api/workspace/${workspaceId}/conversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userMessage),
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
