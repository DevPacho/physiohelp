import { MouseEvent } from 'react'

interface IButtonProps {
	text: string
	title?: string
	onClick: (event: MouseEvent<HTMLButtonElement>) => void
	disabled?: boolean
}

export const Button = ({ text, title, onClick, disabled }: IButtonProps) => (
	<button
		type='button'
		title={title}
		className='bg-primary-light h-10 cursor-pointer rounded-md px-4 text-nowrap text-white hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline'
		onClick={onClick}
		disabled={disabled}
	>
		{text}
	</button>
)
