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
	isLoading: boolean
}

export const PatientsPage = () => {
	const {
		patients,
		patientsCount,
		patientsPerPage,
		currentPage,
		setCurrentPage,
		isLoading,
	} = useOutletContext<IPatientsPageOutletContext>()

	return (
		<main className='flex size-full items-center justify-center overflow-auto p-10'>
			<PatientsTable
				{...{
					patients,
					patientsCount,
					patientsPerPage,
					currentPage,
					setCurrentPage,
					isLoading,
				}}
			/>
		</main>
	)
}
