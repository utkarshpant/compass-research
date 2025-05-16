import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';
import { useFetcher, useSearchParams } from 'react-router';
import { ReadRecommendation, type Resource } from '@prisma/client';
import { useEventSource } from 'remix-utils/sse/react';
import Badge from './Badge';
import useSound from 'use-sound';

export type ResourceJobProgressUpdate =
	| {
			stage:
				| ResourceJobStatus.CHUNK
				| ResourceJobStatus.EMBED
				| ResourceJobStatus.QDRANT
				| ResourceJobStatus.DONE;
			progress: number;
	  }
	| ResourceSummaryChunkUpdate
	| {
			stage: 'recommendation';
			chunk: string;
	  };

type ResourceSummaryChunkUpdate = {
	stage: ResourceJobStatus.SUMMARY;
	chunk: string;
};

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

export default function FileUploadDrawer() {
	const [isOpen, setIsOpen] = useState(false);
	const [jobId, setJobId] = useState<string | null>(null);
	const fetcher = useFetcher();
	const [searchParams, setSearchParams] = useSearchParams();
	const [currentStage, setCurrentStage] = useState<ResourceJobStatus | null>(null);
	const [currentProgress, setCurrentProgress] = useState<number | null>(null);
	const [summary, setSummary] = useState<string>(''); // initialize as empty string
	const [recommendation, setRecommendation] = useState<ReadRecommendation | null>(null);
	// set and remove the event listeners to open and close the drawer
	useEffect(() => {
		const handleDragEnter = (event: DragEvent) => {
			if (!isOpen) {
				setIsOpen(true);
			}
		};

		window.addEventListener('dragenter', handleDragEnter);
		return () => {
			window.removeEventListener('dragenter', handleDragEnter);
		};
	}, [isOpen]);

	// set the BullMQ job ID so that an EventStream can be opened to listen for progress updates
	useEffect(() => {
		if (fetcher.data && fetcher.data.job.id) {
			setJobId(fetcher.data.job.id);
		}
	}, [fetcher.data]);

	const resourceJobUpdate = useEventSource(jobId ? `/api/job/${jobId}` : '', {
		event: 'progress',
	});

	const [playSuccessSound] = useSound('/success.wav', {
		volume: 0.4,
	});

	useEffect(() => {
		if (!resourceJobUpdate) return;
		let parsedUpdate: ResourceJobProgressUpdate;
		try {
			parsedUpdate = JSON.parse(resourceJobUpdate);
		} catch {
			return;
		}
		if (parsedUpdate.stage !== currentStage && parsedUpdate.stage !== 'recommendation') {
			setCurrentStage(parsedUpdate.stage);
		}
		if (
			parsedUpdate.stage !== ResourceJobStatus.SUMMARY &&
			parsedUpdate.stage !== 'recommendation'
		) {
			setCurrentProgress(parsedUpdate.progress);
		}
		if (parsedUpdate.stage === ResourceJobStatus.DONE) {
			playSuccessSound();
		}
		if (parsedUpdate.stage === ResourceJobStatus.SUMMARY) {
			setSummary((prev) => (prev + ' ' + parsedUpdate.chunk).trim());
		}
		if (parsedUpdate.stage === 'recommendation') {
			setRecommendation(parsedUpdate.chunk as ReadRecommendation);
		}
	}, [resourceJobUpdate]);

	const { getInputProps, getRootProps, acceptedFiles } = useDropzone({
		accept: {
			// pdf mime type
			'application/pdf': ['.pdf'],
		},
		multiple: false,
		onDrop(acceptedFiles) {
			// package up into form data and send to server
			const formData = new FormData();
			acceptedFiles.forEach((file) => {
				formData.append('compass-pdf', file);
				// formData.append('workspace', searchParams.get('workspace') || '');
			});
			fetcher.submit(formData, {
				method: 'POST',
				encType: 'multipart/form-data',
				action: `/api/resource?workspace=${searchParams.get('workspace')}`, // replace with actual workspace ID
			});
		},
	});

	const recommendationBadgeVariant =
		recommendation === ReadRecommendation.READ
			? 'success'
			: recommendation === ReadRecommendation.SKIM
			? 'info'
			: recommendation === ReadRecommendation.SKIP
			? 'error'
			: 'default';

	return (
		<Drawer.Root
			open={isOpen}
			onOpenChange={setIsOpen}
			onClose={() => {
				setIsOpen(false);
				setCurrentStage(null);
				setCurrentProgress(null);
				setSummary('');
				setRecommendation(null);
			}}
		>
			{/* <Drawer.Trigger>
				<button className='rounded-md bg-stone-600 text-white p-4 cursor-pointer'>
					Open Drawer
				</button>
			</Drawer.Trigger> */}
			<Drawer.Portal>
				<Drawer.Overlay className='fixed inset-0 backdrop-blur-[1px]' />
				<Drawer.Content
					aria-describedby=''
					className='fixed bottom-0 left-0 right-0 outline-none bg-stone-950 dark:bg-cards h-2/3 px-36 py-12'
				>
					<Drawer.Title>
						<label>
							<input
								type='file'
								className='w-full h-full hidden'
								{...getInputProps()}
							/>
							<h1 className='font-sans font-medium text-primary dark:text-neutral-950 text-2xl tracking-tight'>
								Log a paper
							</h1>
						</label>
					</Drawer.Title>
					<Drawer.Description className='text-primary dark:text-stone-800 pb-4 border-b-[1px] border-b-stone-400'>
						Drag and drop a paper here - we'll summarize it for you and recommend
						whether to read it or not.
					</Drawer.Description>
					<div
						className='flex flex-col w-full h-full text-primary dark:text-black mt-4 gap-6'
						{...getRootProps()}
					>
						<span className='flex flex-row justify-between items-center w-full'>
							<span className='flex flex-col gap-0'>
								<h1 className='text-sm uppercase font-medium tracking-wider'>
									Document
								</h1>
								<h2 className='text-base flex flex-row gap-4 items-baseline'>
									{acceptedFiles.length > 0
										? acceptedFiles.map((file) => <p>{file.name}</p>)
										: 'No files'}
									<Badge
										text={
											resourceJobUpdate && currentStage
												? `${currentStage} (${currentProgress?.toFixed(
														1
												  )}%)`
												: null
										}
										variant={
											currentStage === ResourceJobStatus.DONE
												? 'success'
												: 'default'
										}
									/>
								</h2>
							</span>
						</span>
						<span className='border-amber-400 rounded'>
							<h1 className='text-sm uppercase font-medium tracking-wider'>
								Summary
							</h1>
							<p className='font-serif text-primary dark:text-black'>
								{summary ? summary : 'The summary will appear here.'}
							</p>
						</span>
						<span className='border-amber-400 rounded'>
							<h1 className='text-sm uppercase font-medium tracking-wider'>
								Recommendation
							</h1>
							<p className='text-primary dark:text-black py-2'>
								{recommendation ? (
									<Badge
										text={recommendation}
										variant={recommendationBadgeVariant}
									/>
								) : (
									'Our recommendation to read, skim, or skip.'
								)}
							</p>
						</span>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
