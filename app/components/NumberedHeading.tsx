export function NumberedHeading({
	index,
	title,
	variant = 'regular',
}: {
	index: number;
	title: string;
	variant?: 'small' | 'regular';
}) {
	return (
		<h1
			className={`font-sans ${
				variant === 'regular' ? 'font-medium text-6xl items-stretch -mx-14' : 'text-2xl items-baseline -mx-12'
			} tracking-tight flex gap-2 max-w-[65ch] my-4`}
		>
			<span
				className={`rounded-full p-4 ${
					variant === 'regular' ? 'max-h-12 max-w-14 text-xl my-2' : 'h-10 w-10 text-base'
				} bg-neutral-300 font-semibold flex items-center justify-center`}
			>
				{index}
			</span>
			{title}
		</h1>
	);
}
