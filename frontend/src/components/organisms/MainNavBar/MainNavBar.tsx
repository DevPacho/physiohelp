import { Dispatch, SetStateAction } from 'react'

import { IcMenu } from '@components/atoms'

interface IMainNavBarProps {
	setShowSidebar: Dispatch<SetStateAction<boolean>>
}

export const MainNavBar = ({ setShowSidebar }: IMainNavBarProps) => (
	<header className='flex h-24 min-h-24 items-center justify-between gap-5 bg-white px-10 shadow xl:justify-end'>
		<button
			type='button'
			className='cursor-pointer xl:hidden'
			onClick={() => setShowSidebar(true)}
		>
			<IcMenu className='size-5 fill-black' />
		</button>
		<h3 className='text-primary line-clamp-1 text-xl font-semibold'>
			Dra. Victoria Eugenia Potes Arana
		</h3>
	</header>
)
