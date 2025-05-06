import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

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
				<Drawer.Overlay className='fixed inset-0' />
				<Drawer.Content className='fixed bottom-0 left-0 right-0 outline-none bg-stone-950 h-2/3 p-12'>
					<div className='flex flex-row justify-between items-baseline'>
						<Drawer.Title>
							<label>
								<input
									type='file'
									className='w-full h-full bg-red-400'
								/>
								<h1 className='font-sans font-medium text-white text-2xl uppercase tracking-normal'>
									Log a paper
								</h1>
							</label>
						</Drawer.Title>
						<Drawer.Close className='text-white'>
							<button className='px-2 py-1 text-xs rounded-md bg-stone-700 cursor-pointer'>
								Close
							</button>
						</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
