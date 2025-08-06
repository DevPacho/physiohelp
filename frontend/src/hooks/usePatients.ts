import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { createPatient, getPatients, getPatientsCount } from '@api'

import { IPatient } from '@interfaces'

import toast from 'react-hot-toast'

const patientsPerPage = 12
const searchDelay = 500

interface IUsePatientsReturn {
	patients: IPatient[]
	setPatients: Dispatch<SetStateAction<IPatient[]>>
	patientsCount: number | null
	patientsPerPage: number
	patientToSearch: string
	setPatientToSearch: Dispatch<SetStateAction<string>>
	currentPage: number
	setCurrentPage: Dispatch<SetStateAction<number>>
	isLoading: boolean
	isCreatePatientModalOpen: boolean
	setIsCreatePatientModalOpen: Dispatch<SetStateAction<boolean>>
	createNewPatient: (newPatientData: Omit<IPatient, 'id'>) => Promise<void>
	isCreatingPatient: boolean
}

export const usePatients = (): IUsePatientsReturn => {
	const [patients, setPatients] = useState<IPatient[]>([])
	const [patientsCount, setPatientsCount] = useState<number | null>(null)
	const [patientToSearch, setPatientToSearch] = useState<string>('')
	const [debouncedPatientToSearch, setDebouncedPatientToSearch] =
		useState<string>('')
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCreatingPatient, setIsCreatingPatient] = useState<boolean>(false)
	const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] =
		useState<boolean>(false)

	const cachedPatients = useRef<Record<string, IPatient[]>>({})

	const fetchPatientsCount = async () => {
		getPatientsCount({ search: debouncedPatientToSearch })
			.then(response => setPatientsCount(response.count))
			.catch(() =>
				toast.error(
					'Ha ocurrido un error al cargar la cantidad total de pacientes'
				)
			)
	}

	const fetchPatients = async () => {
		const cacheKey = `${currentPage}-${debouncedPatientToSearch}`

		if (cachedPatients.current[cacheKey]) {
			setPatients(cachedPatients.current[cacheKey])
			return
		}

		setIsLoading(true)

		getPatients({
			skip: (currentPage - 1) * patientsPerPage,
			limit: patientsPerPage,
			search: debouncedPatientToSearch,
		})
			.then(response => {
				cachedPatients.current[cacheKey] = response
				setPatients(response)
			})
			.catch(() => toast.error('Ha ocurrido un error al cargar los pacientes'))
			.finally(() => setIsLoading(false))
	}

	const createNewPatient = async (patientData: Omit<IPatient, 'id'>) => {
		setIsCreatingPatient(true)

		createPatient({
			patientData: patientData as IPatient,
		})
			.then(response => {
				setPatients(prevPatients => [response, ...prevPatients])
				setPatientsCount(prevPatientsCount =>
					prevPatientsCount ? prevPatientsCount + 1 : 1
				)
				cachedPatients.current = {}

				if (currentPage !== 1) {
					setCurrentPage(1)
				}
			})
			.then(() => {
				setIsCreatePatientModalOpen(false)
				toast.success('Paciente creado exitosamente')
			})
			.catch(error => {
				toast.error('Ha ocurrido un error al crear el paciente')
				throw error
			})
			.finally(() => setIsCreatingPatient(false))
	}

	useEffect(() => {
		setIsLoading(true)

		const delay = setTimeout(() => {
			setDebouncedPatientToSearch(patientToSearch)

			if (patientToSearch !== debouncedPatientToSearch) {
				setCurrentPage(1)
				cachedPatients.current = {}
			}
		}, searchDelay)

		return () => {
			clearTimeout(delay)
			setIsLoading(false)
		}
	}, [patientToSearch])

	useEffect(() => {
		fetchPatientsCount()
	}, [debouncedPatientToSearch])

	useEffect(() => {
		fetchPatients()
	}, [currentPage, debouncedPatientToSearch])

	return {
		patients,
		setPatients,
		patientsCount,
		patientsPerPage,
		patientToSearch,
		setPatientToSearch,
		currentPage,
		setCurrentPage,
		isLoading,
		isCreatePatientModalOpen,
		setIsCreatePatientModalOpen,
		createNewPatient,
		isCreatingPatient,
	}
}
