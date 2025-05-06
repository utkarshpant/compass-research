interface UserInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function UserInput({ ...props }: UserInputProps) {
	return (
		<input
			className='w-full rounded-2xl text-base font-normal font-serif bg-olive py-4 px-6 text-white focus:ring-amber-400 shadow-xl my-2 selection:bg-white/25 focus:ring-2 focus:ring-offset-2 focus:outline-none'
			placeholder='What is your research question?'
			{...props}
		/>
	);
}
