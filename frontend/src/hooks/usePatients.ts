import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { createPatient, getPatients, getPatientsCount } from '@api'

import { IPatient } from '@interfaces'

import toast from 'react-hot-toast'

const patientsPerPage = 12

interface IUsePatientsReturn {
	patients: IPatient[]
	setPatients: Dispatch<SetStateAction<IPatient[]>>
	patientsCount: number | null
	patientsPerPage: number
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
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCreatingPatient, setIsCreatingPatient] = useState<boolean>(false)
	const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] =
		useState<boolean>(false)

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
		fetchPatientsCount()
	}, [])

	useEffect(() => {
		fetchPatients()
	}, [currentPage])

	return {
		patients,
		setPatients,
		patientsCount,
		patientsPerPage,
		currentPage,
		setCurrentPage,
		isLoading,
		isCreatePatientModalOpen,
		setIsCreatePatientModalOpen,
		createNewPatient,
		isCreatingPatient,
	}
}
