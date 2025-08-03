import { useEffect, useState } from 'react'

import { getPatients, getPatientsCount } from '@api'

import { IPatient } from '@interfaces'

import { MainNavBar, MainSideBar } from '@components/organisms'
import toast from 'react-hot-toast'
import { Outlet } from 'react-router'

const patientsPerPage = 12

export const MainLayout = () => {
	const [patients, setPatients] = useState<IPatient[]>([])
	const [patientsCount, setPatientsCount] = useState<number | null>(null)
	const [currentPage, setCurrentPage] = useState<number>(1)

	const [showSidebar, setShowSidebar] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	useEffect(() => {
		getPatientsCount()
			.then(response => setPatientsCount(response.count))
			.catch(() =>
				toast.error(
					'Ha ocurrido un error al cargar la cantidad total de pacientes'
				)
			)
	}, [])

	useEffect(() => {
		setIsLoading(true)

		getPatients({
			skip: (currentPage - 1) * patientsPerPage,
			limit: patientsPerPage,
		})
			.then(response => setPatients(response))
			.catch(() => toast.error('Ha ocurrido un error al cargar los pacientes'))
			.finally(() => setIsLoading(false))
	}, [currentPage])

	return (
		<div className='flex h-svh w-svw shrink-0 overflow-hidden bg-[#E4F8FF] xl:h-screen xl:max-h-screen'>
			<MainSideBar {...{ showSidebar, setShowSidebar }} />
			{showSidebar && (
				<button
					type='button'
					onClick={() => setShowSidebar(false)}
					className='text-primary absolute top-4 right-4 z-10 cursor-pointer text-3xl font-semibold xl:hidden'
				>
					X
				</button>
			)}
			<section
				className={`flex flex-1 flex-col overflow-auto ${showSidebar && 'blur-sm xl:blur-none'}`}
				onClick={() => showSidebar && setShowSidebar(false)}
			>
				<MainNavBar {...{ setShowSidebar }} />
				<Outlet
					context={{
						patients,
						patientsCount,
						patientsPerPage,
						currentPage,
						setCurrentPage,
						isLoading,
					}}
				/>
			</section>
		</div>
	)
}
