import { MouseEvent } from 'react'

interface IButtonProps {
	text: string
	onClick: (event: MouseEvent<HTMLButtonElement>) => void
	disabled?: boolean
}

export const Button = ({ text, onClick, disabled }: IButtonProps) => (
	<button
		type='button'
		className='bg-primary-light h-10 cursor-pointer rounded-md px-4 text-white hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline text-nowrap'
		onClick={onClick}
		disabled={disabled}
	>
		{text}
	</button>
)
