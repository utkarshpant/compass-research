interface UserInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
	ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

export default function UserInput({ ref, ...props }: UserInputProps) {
	return (
		<input
			className='w-full rounded-2xl text-base font-normal font-serif bg-olive dark:bg-emerald-950 py-4 px-6 text-white focus:ring-amber-400 dark:focus:ring-amber-700 shadow-xl my-2 selection:bg-white/25 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:bg-stone-700 transition-colors'
			placeholder='What is your research question?'
			ref={ref as React.RefObject<HTMLInputElement>}
			{...props}
		/>
	);
}
