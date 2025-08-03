import type { IIconProps } from './icons.interfaces'

export const IcChevron = ({ className }: IIconProps) => (
	<svg
		viewBox='0 0 11 6'
		xmlns='http://www.w3.org/2000/svg'
		className={`${className} shrink-0`}
	>
		<path d='M5.71875 0.125C5.875 -0.03125 6.09375 -0.03125 6.25 0.125L10.875 4.71875C11.0312 4.84375 11.0312 5.09375 10.875 5.25L10.25 5.84375C10.125 6 9.875 6 9.71875 5.84375L6 2.15625L2.25 5.84375C2.09375 6 1.875 6 1.71875 5.84375L1.09375 5.25C0.9375 5.09375 0.9375 4.84375 1.09375 4.71875L5.71875 0.125Z' />
	</svg>
)
