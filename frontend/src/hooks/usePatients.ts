import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { getPatients, getPatientsCount } from '@api'

import { IPatient } from '@interfaces'

import toast from 'react-hot-toast'

const patientsPerPage = 12

interface IUsePatientsReturn {
	patients: IPatient[]
	patientsCount: number | null
	patientsPerPage: number
	currentPage: number
	setCurrentPage: Dispatch<SetStateAction<number>>
	isLoading: boolean
}

export const usePatients = (): IUsePatientsReturn => {
	const [patients, setPatients] = useState<IPatient[]>([])
	const [patientsCount, setPatientsCount] = useState<number | null>(null)
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const cachedPatients = useRef<Record<number, IPatient[]>>({})

	const fetchPatientsCount = async () => {
		getPatientsCount()
			.then(response => setPatientsCount(response.count))
			.catch(() =>
				toast.error(
					'Ha ocurrido un error al cargar la cantidad total de pacientes'
				)
			)
	}

	const fetchPatients = async () => {
		if (cachedPatients.current[currentPage]) {
			setPatients(cachedPatients.current[currentPage])
			return
		}

		setIsLoading(true)

		getPatients({
			skip: (currentPage - 1) * patientsPerPage,
			limit: patientsPerPage,
		})
			.then(response => {
				cachedPatients.current[currentPage] = response
				setPatients(response)
			})
			.catch(() => toast.error('Ha ocurrido un error al cargar los pacientes'))
			.finally(() => setIsLoading(false))
	}

	useEffect(() => {
		fetchPatientsCount()
	}, [])

	useEffect(() => {
		fetchPatients()
	}, [currentPage])

	return {
		patients,
		patientsCount,
		currentPage,
		patientsPerPage,
		isLoading,
		setCurrentPage,
	}
}
