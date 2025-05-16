import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface UserInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLDivElement> {
	ref?: React.RefObject<HTMLInputElement | HTMLDivElement | null>;
	type?: 'text' | 'textarea';
	disabled?: boolean;
	placeholder?: string;
}

export interface UserInputHandle {
	reset: () => void;
	value: string;
}

const UserInput = forwardRef<UserInputHandle, UserInputProps>(function UserInput(
	{ type = 'text', disabled = false, placeholder = '', ...props },
	ref
) {
	const [textAreaText, setTextAreaText] = useState<string>('');
	const inputRef = useRef<HTMLInputElement>(null);
	const textAreaRef = useRef<HTMLDivElement>(null);

	// augment the ref to include a reset function that appropriately clears the inputs
	useImperativeHandle(ref, () => ({
		reset: () => {
			setTextAreaText('');
			if (inputRef.current) {
				inputRef.current.value = '';
			}
		},
		value: type === 'text' ? (inputRef.current?.value as string) : textAreaText,
	}));

	useEffect(() => {
		if (type === 'textarea' && textAreaRef?.current) {
			const el = textAreaRef.current;
			// Move cursor to the end
			const range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			const sel = window.getSelection();
			if (sel) {
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	}, [textAreaText, type]);

	if (type === 'text') {
		return (
			<input
				className='w-full rounded-2xl text-base font-normal font-serif bg-olive dark:bg-emerald-950 py-4 px-6 text-white focus:ring-amber-400 dark:focus:ring-amber-700 shadow-xl my-2 selection:bg-white/25 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:bg-stone-700 transition-colors'
				placeholder='What is your research question?'
				ref={inputRef}
				disabled={disabled}
				{...props}
			/>
		);
	}
	console.log(textAreaText);
	return (
		<div
			className='flex flex-col w-full relative'
			onClick={() => textAreaRef.current?.focus()}
		>
			{!textAreaText && (
				<p className='absolute top-6 left-6 text-white/70 font-serif'>{placeholder}</p>
			)}
			<div
				className={`w-full rounded-2xl text-base font-normal font-serif ${
					disabled ? 'bg-stone-700' : 'bg-olive'
				} dark:bg-emerald-950 py-4 px-6 text-white focus:ring-amber-400 dark:focus:ring-amber-700 shadow-xl my-2 selection:bg-white/25 focus:ring-2 focus:ring-offset-2 min-h-14 focus:outline-none transition-colors`}
				ref={textAreaRef}
				contentEditable={!disabled}
				onInput={(e) => {
					const target = e.target as HTMLDivElement;
					if (target.innerText !== ' ') {
						setTextAreaText(
							textAreaText.trim() === '' ? target.innerText : target.innerText.trim()
						);
					}
				}}
				suppressContentEditableWarning
				{...props}
			>
				{textAreaText}
			</div>
		</div>
	);
});

export default UserInput;
