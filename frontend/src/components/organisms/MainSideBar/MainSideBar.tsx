import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { PhysioHelpLogo } from '@assets'

import { IcMedicalFile, IcUser } from '@components/atoms'
import { Link, useLocation } from 'react-router'

interface IMainSideBarProps {
	showSidebar: boolean
	setShowSidebar: Dispatch<SetStateAction<boolean>>
}

export const MainSideBar = ({
	showSidebar,
	setShowSidebar,
}: IMainSideBarProps) => {
	const [activeTab, setActiveTab] = useState<string>('')

	const { pathname } = useLocation()

	useEffect(() => {
		if (pathname.includes('patients')) setActiveTab('patients')
		if (pathname.includes('medical-records')) setActiveTab('medical-records')

		setShowSidebar(false)
	}, [pathname])

	return (
		<aside
			className={`${
				showSidebar ? 'translate-x-0' : '-translate-x-full'
			} bg-primary fixed z-10 flex h-full w-[300px] flex-col items-center shadow transition-all duration-300 ease-in-out xl:static xl:translate-x-0`}
		>
			<img
				src={PhysioHelpLogo}
				className='h-24 min-h-24 w-full object-center'
				alt='PhysioHelp Logo'
			/>
			<nav className='flex h-full w-full flex-col text-white *:flex *:h-14 *:items-center *:gap-3 xl:text-lg'>
				<Link
					to='/patients'
					className={`group px-10 hover:bg-[#20499C] ${
						activeTab === 'patients' && 'bg-[#20499C]'
					}`}
				>
					<IcUser className='size-5 fill-white' />
					<p className='line-clamp-1 group-hover:underline'>Pacientes</p>
				</Link>
				<Link
					to='/medical-records'
					className={`group px-10 hover:bg-[#20499C] ${
						activeTab === 'medical-records' && 'bg-[#20499C]'
					}`}
				>
					<IcMedicalFile className='size-5 fill-white' />
					<p className='line-clamp-1 group-hover:underline'>
						Historias Clínicas
					</p>
				</Link>
			</nav>
		</aside>
	)
}
