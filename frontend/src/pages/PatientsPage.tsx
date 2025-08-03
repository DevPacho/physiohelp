import { Dispatch, SetStateAction } from 'react'

import { IPatient } from '@interfaces'

import { PatientsTable } from '@components/organisms'
import { useOutletContext } from 'react-router'

interface IPatientsPageOutletContext {
	patients: IPatient[]
	patientsCount: number
	patientsPerPage: number
	currentPage: number
	setCurrentPage: Dispatch<SetStateAction<number>>
	visiblePages: IPatient[]
	setVisiblePages: Dispatch<SetStateAction<IPatient[]>>
	isLoading: boolean
}

export const PatientsPage = () => {
	const {
		patients,
		patientsCount,
		patientsPerPage,
		currentPage,
		setCurrentPage,
		visiblePages,
		setVisiblePages,
		isLoading,
	} = useOutletContext<IPatientsPageOutletContext>()

	return (
		<main className='flex h-full w-full items-center justify-center overflow-hidden p-10'>
			<PatientsTable
				{...{
					patients,
					patientsCount,
					patientsPerPage,
					currentPage,
					setCurrentPage,
					visiblePages,
					setVisiblePages,
					isLoading,
				}}
			/>
		</main>
	)
}
