import RightArrow from '/arrow_forward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg?url';
import LeftArrow from '/arrow_left_alt_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg?url';
import DownArrow from '/arrow_downward_alt_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg?url';
import UpArrow from '/arrow_upward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg?url';

const Arrow = () => {
	return null;
};

Arrow.Left = () => (
	<img
		alt='Left arrow'
		src={LeftArrow}
	/>
);
Arrow.Right = () => (
	<img
		alt='Right arrow'
		src={RightArrow}
	/>
);
Arrow.Up = () => (
	<img
		alt='Up arrow'
		src={UpArrow}
	/>
);
Arrow.Up = () => (
	<img
		alt='Down arrow'
		src={DownArrow}
	/>
);

export default Arrow;
