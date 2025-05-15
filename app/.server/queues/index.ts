import { Queue, QueueEvents, Worker, type Processor } from 'bullmq';
import Redis from 'ioredis';
import prisma from '../db';
import { minio } from '../fileUploadHandler';
import { chunkPdf } from '../utils/resource-utils';
import OpenAI from 'openai';
import { qdrant } from '../utils/qdrant';
import { summary_prompt, summarySchema } from '../utils/openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379/0', {
	maxRetriesPerRequest: null,
});

type RegisteredQueue = {
	queue: Queue;
	queueEvents: QueueEvents;
	worker: Worker;
};

type AugmentedQueue<T> = Queue<T> & {
	events: QueueEvents;
};

declare global {
	var __registeredQueues: Record<string, RegisteredQueue> | undefined;
}

const registeredQueues = global.__registeredQueues || (global.__registeredQueues = {});

export function registerQueue<JobDataType>(name: string, processor: Processor<JobDataType>) {
	// check if this queue has already been registered;
	if (!registeredQueues[name]) {
		const queue = new Queue(name, {
			connection: redis,
			defaultJobOptions: {
				removeOnComplete: 50,
				removeOnFail: 50,
				attempts: 3,
			},
		});
		const queueEvents = new QueueEvents(name, { connection: redis });
		const worker = new Worker<JobDataType>(name, processor, {
			connection: redis,
			lockDuration: 1000 * 60 * 15, // 15 minutes
			concurrency: 8,
		});

		registeredQueues[name] = {
			queue,
			queueEvents,
			worker,
		};
	}
	const queue = registeredQueues[name].queue as AugmentedQueue<JobDataType>;
	queue.events = registeredQueues[name].queueEvents;
	return queue;
}

const openai = new OpenAI();

/**
 * The different statuses a Resource job can be in, listed sequentially.
 * At each of these stages, the job's progress will be updated.
 */
export enum ResourceJobStatus {
	CHUNK = 'chunk',
	EMBED = 'embed',
	QDRANT = 'qdrant',
	SUMMARY = 'summary',
	DONE = 'done',
}

export type ResourceJobData = {
	/** The `id` of the `Resource` that is being processed right now. */
	resourceId: string;
	// /** The `id` of the Workspace this resource belongs to. */
	// workspaceId: string;
	// /** The original name of the file that was uploaded to MinIO. */
	// fileName: string;
};

// TODO: move to a common location so that server and client bundles can both use this type
export type ResourceJobProgressUpdate = {
	stage: ResourceJobStatus.CHUNK | ResourceJobStatus.EMBED | ResourceJobStatus.QDRANT | ResourceJobStatus.DONE;
	progress: number;
} | ResourceSummaryChunkUpdate;

type ResourceSummaryChunkUpdate = {
	stage: ResourceJobStatus.SUMMARY;
	chunk: string;
}

/**
 * The queue to which all long-running Resource processing/chunking/summarization jobs are added.
 */
export const resourceQueue = registerQueue<ResourceJobData>('resource', async (job) => {
	const { resourceId } = job.data;
	const resource = await prisma.resource.findUniqueOrThrow({
		where: { id: resourceId },
		include: {
			workspaces: {
				select: {
					ideas: true,
					theme: true,
					type: true,
				},
			},
		},
	});
	// get the file stream for the specified resource from minio
	const fileStream = await minio.getObject('compass-pdfs', resource.externalId);
	if (!fileStream) {
		throw new Error(`File not found for resource ${resourceId}`);
	}

	// start chunking stage and notify progress
	await job.updateProgress(
		JSON.stringify({
			stage: ResourceJobStatus.CHUNK,
			progress: 0,
		})
	);
	const chunks = await chunkPdf(fileStream);

	await job.updateProgress({
		stage: ResourceJobStatus.CHUNK,
		progress: 100,
	});

	// start embedding stage and notify progress
	let done = 0;
	for (const ch of chunks) {
		const emb = await openai.embeddings.create({
			model: 'text-embedding-3-small',
			input: ch,
			dimensions: 1536,
		});

		await job.updateProgress({
			stage: ResourceJobStatus.EMBED,
			progress: (++done / chunks.length) * 100,
		});
		/* delay heavy insert until next step */
		await qdrant
			.upsert(
				'resources', // collection
				{
					points: [
						{
							id: crypto.randomUUID(),
							vector: emb.data[0].embedding,
							payload: { resourceId, content: ch },
						},
					],
					wait: false,
				}
			)
			.catch((err) => console.error('Error inserting into Qdrant:', err));
	}

	await job.updateProgress({ stage: ResourceJobStatus.QDRANT, progress: 100 });

	// summarize PDF using first and last chunks
	const first = chunks[0];
	const last = chunks[chunks.length - 1];
	const prompt = summary_prompt(first, last, resource.workspaces[0]);
	const response = await openai.responses.parse({
		model: 'gpt-4o-mini',
		input: [
			{ role: 'system', content: prompt },
			{ role: 'user', content: prompt },
		],
		text: {
			format: zodTextFormat(summarySchema, 'summary'),
		},
	});
	await prisma.resource.update({
		where: {
			id: resourceId,
		},
		data: {
			embeddingStatus: 'AVAILABLE',
			content: response?.output_parsed?.summary,
			recommendation: response?.output_parsed?.readRecommendation,
		},
	});
	await job.updateProgress({ stage: ResourceJobStatus.SUMMARY, chunk: "" });
	const summaryChunks = response?.output_parsed?.summary.split(" ");
	for (const chunk of summaryChunks as string[]) {
		await job.updateProgress({
			stage: ResourceJobStatus.SUMMARY,
			chunk: chunk,
		});
		await new Promise((resolve) => setTimeout(resolve, 80)); // 80ms delay
	}
	await job.updateProgress({
		stage: "recommendation",
		chunk: response?.output_parsed?.readRecommendation,
	});
	await job.updateProgress({
		stage: ResourceJobStatus.DONE,
		progress: 100,
	});
	// });
});
