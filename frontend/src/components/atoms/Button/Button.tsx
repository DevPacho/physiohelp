import { MouseEvent } from 'react'

interface IButtonProps {
	text: string
	onClick: (event: MouseEvent<HTMLButtonElement>) => void
	disabled?: boolean
}

export const Button = ({ text, onClick, disabled }: IButtonProps) => (
	<button
		type='button'
		className='bg-primary-light cursor-pointer rounded-md px-4 py-2 text-white hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline'
		onClick={onClick}
		disabled={disabled}
	>
		{text}
	</button>
)
