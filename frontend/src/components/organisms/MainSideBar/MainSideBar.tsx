import { useEffect, useState } from 'react'

import { PhysioHelpIcon, PhysioHelpLogo } from '@assets'

import { IcUser } from '@components/atoms'
import { Link, useLocation } from 'react-router'

interface IMainSideBarProps {
	collapseSidebar: boolean
	showSidebar: boolean
}

export const MainSideBar = ({
	collapseSidebar,
	showSidebar,
}: IMainSideBarProps) => {
	const [activeTab, setActiveTab] = useState<string>('')

	const { pathname } = useLocation()

	useEffect(() => {
		if (pathname.includes('patients')) setActiveTab('patients')
		if (pathname.includes('medical-records')) setActiveTab('medical-records')
	}, [pathname])

	return (
		<aside
			className={`${
				showSidebar ? 'translate-x-0' : '-translate-x-full'
			} bg-primary fixed z-10 flex h-full flex-col items-center shadow transition-all duration-300 ease-in-out xl:static xl:translate-x-0 ${
				collapseSidebar ? 'xl:w-20' : 'xl:w-[300px]'
			} w-[300px]`}
		>
			{collapseSidebar && !showSidebar ? (
				<img
					src={PhysioHelpIcon}
					className='h-24 min-h-24 w-12 object-contain object-center transition-all duration-300'
					alt='PhysioHelp Icon'
				/>
			) : (
				<img
					src={PhysioHelpLogo}
					className='h-24 min-h-24 w-full object-center transition-all duration-300'
					alt='PhysioHelp Logo'
				/>
			)}
			<nav className='flex h-full w-full flex-col text-white *:flex *:h-14 *:items-center *:gap-3 xl:text-lg'>
				<Link
					to='/patients'
					className={`group hover:bg-primary-light ${
						collapseSidebar && !showSidebar
							? 'xl:justify-center xl:px-2'
							: 'px-10'
					} ${activeTab === 'patients' && 'bg-primary-light'}`}
				>
					<IcUser className='size-5 flex-shrink-0 fill-white' />
					<p
						className={`line-clamp-1 transition-all duration-300 group-hover:underline ${
							collapseSidebar && !showSidebar ? 'xl:hidden' : ''
						}`}
					>
						Pacientes
					</p>
				</Link>
			</nav>
		</aside>
	)
}
