import { ReactElement } from 'react'

interface IModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	subtitle: string
	children: ReactElement
	modalContentClassName?: string
}

export const Modal = ({
	isOpen,
	onClose,
	title,
	subtitle,
	children,
	modalContentClassName,
}: IModalProps) => {
	if (!isOpen) return null

	return (
		<div className='fixed top-0 left-0 z-10 flex h-full w-full justify-center bg-[#1B2330B2] p-10 backdrop-blur-sm'>
			<section
				className={`relative m-auto max-h-full overflow-y-auto rounded bg-white p-5 ${modalContentClassName}`}
			>
				<header className='flex items-center justify-between'>
					<h2 className='text-xl font-semibold text-black'>{title}</h2>
					<button
						type='button'
						className='cursor-pointer text-2xl font-semibold text-black'
						onClick={onClose}
					>
						X
					</button>
				</header>
				<h3 className='text-sm text-black'>{subtitle}</h3>
				{children}
			</section>
		</div>
	)
}
