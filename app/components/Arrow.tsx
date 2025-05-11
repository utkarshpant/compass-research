const Arrow = () => {
	return null;
};

Arrow.Left = () => <span className='font-sans text-2xl m-2'>&larr;</span>;
Arrow.Right = () => <span className='font-sans text-2xl m-2'>&rarr;</span>;
Arrow.Up = () => <span className='font-captions text-2xl m-2'>&uarr;</span>;
Arrow.Down = () => <span className='font-captions text-2xl m-2'>&darr;</span>;

export default Arrow;
