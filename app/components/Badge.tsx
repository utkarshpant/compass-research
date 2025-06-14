import { motion } from 'motion/react';

type BadgeProps = {
	variant?: 'default' | 'info' | 'error' | 'success';
	text: string | null;
};

export default function Badge({ variant = 'default', text }: BadgeProps) {
	const variantClasses = {
		default: 'bg-amber-300 dark:bg-amber-500',
		info: 'bg-blue-600 dark:bg-blue-600',
		error: 'bg-red-600 dark:bg-red-600',
		success: 'bg-green-600 dark:bg-green-600',
	};
	const badgeMotionVariants = {
		hidden: { opacity: 0, scale: 0.8, filter: 'blur(1px)' },
		visible: {
			opacity: 1,
			scale: 1,
			filter: 'blur(0px)',
			transition: { staggerChildren: 0.1 },
		},
	};
	if (!text) return null;
	return (
		<motion.span
			variants={badgeMotionVariants}
			initial='hidden'
			animate='visible'
			className={`rounded-full text-xs font-medium uppercase tracking-wider w-fit px-4 py-2 ${variantClasses[variant]} select-none`}
		>
			{text
				? text.split(" ").map((char, index) => (
						<motion.span
							key={`${char}-${index}`}
							// as the badge transitions between variants, the characters also transition to the corresponding new state
							variants={badgeMotionVariants}
							className='text-white inline-block'
						>
							{char}&nbsp;
						</motion.span>
				  ))
				: null}
		</motion.span>
	);
}
