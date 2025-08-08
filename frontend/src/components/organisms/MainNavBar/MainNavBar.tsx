import { Dispatch, SetStateAction } from 'react'

import { IcMenu, IcMenuChevron } from '@components/atoms'

interface IMainNavBarProps {
	collapseSidebar: boolean
	setCollapseSidebar: Dispatch<SetStateAction<boolean>>
	setShowSidebar: Dispatch<SetStateAction<boolean>>
}

export const MainNavBar = ({
	collapseSidebar,
	setCollapseSidebar,
	setShowSidebar,
}: IMainNavBarProps) => (
	<header className='flex h-24 min-h-24 items-center justify-between gap-5 bg-white px-10 shadow'>
		<div className='flex items-center gap-3'>
			<button
				type='button'
				className='cursor-pointer xl:hidden'
				onClick={() => setShowSidebar(true)}
			>
				<IcMenu className='size-5 fill-black' />
			</button>
			<button
				type='button'
				className='hidden cursor-pointer xl:flex'
				onClick={() => setCollapseSidebar(!collapseSidebar)}
			>
				<IcMenuChevron
					className={`size-5 fill-black transition-transform duration-300 ${
						collapseSidebar ? 'rotate-180' : ''
					}`}
				/>
			</button>
		</div>
		<h3 className='line-clamp-1 text-xl font-semibold text-black'>
			Dra. Victoria Eugenia Potes Arana
		</h3>
	</header>
)
