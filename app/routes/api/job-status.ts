import type { Route } from './+types/job-status';
import { ResourceJobStatus, resourceQueue, type ResourceJobProgressUpdate } from '~/.server/queues';
import { eventStream } from 'remix-utils/sse/server';
// const { Job } = BullMQ;

export async function loader({ request, params }: Route.LoaderArgs) {
	const job = await resourceQueue.getJob(params.jobId);
	if (!job) {
		return new Response('Job not found', { status: 404 });
	}
	return eventStream(
		request.signal,
		function setup(send) {
			resourceQueue.events.addListener('progress', onProgress);
			job.isCompleted().then((completed) => {
				if (completed) {
					send({
						event: 'progress',
						data: JSON.stringify({
							stage: ResourceJobStatus.DONE,
							progress: 100,
						} satisfies ResourceJobProgressUpdate),
					});
				}
			});

			function onProgress({
				jobId,
				data,
			}: {
				jobId: string;
				data: ResourceJobProgressUpdate;
			}) {
				if (jobId !== params.jobId) return;
				send({ event: 'progress', data: JSON.stringify(data) });
				if (data.stage === ResourceJobStatus.DONE && data.progress === 100) {
					resourceQueue.events.removeListener('progress', onProgress);
				}
			}

			return function clear() {
				resourceQueue.events.removeListener('progress', onProgress);
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
