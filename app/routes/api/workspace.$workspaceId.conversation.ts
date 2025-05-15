import { eventStream } from 'remix-utils/sse/server';
import type { Route } from './+types/workspace.$workspaceId.conversation';

export function loader({ request }: Route.LoaderArgs) {
	return eventStream(
		request.signal,
		function setup(send) {
			async function run() {
				const response = 'This is a sample response from the server. [DONE]';
				for (const chunk of response.split(' ')) {
					send({
						event: 'message',
						data: chunk,
					});
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}

			run();

			// Return a cleanup function
			return function cleanup() {
				// Perform any necessary cleanup here
			};
		},
		{
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
			},
		}
	);
}

export async function action({ request, params }: Route.ActionArgs) {
	return new Response(null, {
		status: 200,
	});
}
