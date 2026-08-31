import { useState } from 'react'

import { MainNavBar, MainSideBar } from '@components/organisms'
import { Outlet } from 'react-router'

export const MainLayout = () => {
	const [showSidebar, setShowSidebar] = useState<boolean>(false)
	const [collapseSidebar, setCollapseSidebar] = useState<boolean>(false)

	return (
		<div className='flex h-svh w-svw shrink-0 overflow-hidden bg-[#E4F8FF] xl:h-screen xl:max-h-screen'>
			<MainSideBar {...{ collapseSidebar, showSidebar, setShowSidebar }} />
			{showSidebar && (
				<button
					type='button'
					onClick={() => setShowSidebar(false)}
					className='absolute top-4 right-4 z-10 cursor-pointer text-3xl font-semibold text-black xl:hidden'
				>
					X
				</button>
			)}
			<section
				className={`flex flex-1 flex-col overflow-auto ${showSidebar && 'blur-sm xl:blur-none'}`}
				onClick={() => showSidebar && setShowSidebar(false)}
			>
				<MainNavBar
					{...{ collapseSidebar, setCollapseSidebar, setShowSidebar }}
				/>
				<Outlet />
			</section>
		</div>
	)
}
