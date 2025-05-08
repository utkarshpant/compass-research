import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';
import { useObjectUrls } from '~/hooks/useObjectUrls';
import { useFetcher, useSearchParams, useSubmit } from 'react-router';

export default function FileUploadDrawer() {
	const [isOpen, setIsOpen] = useState(false);
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

	const fetcher = useFetcher();
	const [searchParams, setSearchParams] = useSearchParams();

	const { isDragAccept, isDragReject, getInputProps, getRootProps, acceptedFiles } = useDropzone({
		accept: {
			// pdf mime type
			'application/pdf': ['.pdf'],
		},
		multiple: false,
		onDrop(acceptedFiles, fileRejections, event) {
			// package up into form data and send to server
			const formData = new FormData();
			acceptedFiles.forEach((file) => {
				formData.append('compass-pdf', file);
				formData.append('workspace', searchParams.get('workspace') || '');
			});
			fetcher.submit(formData, {
				method: 'POST',
				encType: 'multipart/form-data',
				action: `/?index`, // replace with actual workspace ID
			});
		},
	});

	return (
		<Drawer.Root
			open={isOpen}
			onOpenChange={setIsOpen}
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
					className='fixed bottom-0 left-0 right-0 outline-none bg-stone-950 dark:bg-cards h-3/5 px-36 py-12'
					// {...getRootProps()}
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
					<Drawer.Description className='text-primary dark:text-stone-800'>
						Drag and drop a paper here - we'll summarize it for you and recommend
						whether to read it or not.
					</Drawer.Description>
					<div
						className='flex flex-row justify-between items-baseline h-full'
						{...getRootProps()}
					>
						{acceptedFiles.length > 0
							? acceptedFiles.map((file) => <p>{file.name}</p>)
							: 'No files'}
					</div>
					{/* <Drawer.Close className='text-white'>
							<div className='px-4 py-2 text-xs rounded bg-stone-700 dark:bg-stone-900 cursor-pointer'>
								Close
							</div>
						</Drawer.Close> */}
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
