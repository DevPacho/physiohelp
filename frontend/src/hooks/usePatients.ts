import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import {
	createPatient,
	deletePatient,
	getPatients,
	getPatientsCount,
	updatePatient,
} from '@api'

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
	isPatientModalOpen: boolean
	setIsPatientModalOpen: Dispatch<SetStateAction<boolean>>
	patientModalType: 'create' | 'edit'
	setPatientModalType: Dispatch<SetStateAction<'create' | 'edit'>>
	selectedPatient: IPatient | null
	setSelectedPatient: Dispatch<SetStateAction<IPatient | null>>
	handlePatientSubmit: (
		data:
			| Omit<IPatient, 'id'>
			| { patientId: number; patientData: Partial<IPatient> }
	) => Promise<void>
	isPatientModalLoading: boolean
	isDeletePatientModalOpen: boolean
	setIsDeletePatientModalOpen: Dispatch<SetStateAction<boolean>>
	selectedPatientToDelete: IPatient | null
	setSelectedPatientToDelete: Dispatch<SetStateAction<IPatient | null>>
	handleDeletePatient: (patientId: number) => Promise<void>
	isDeletingPatient: boolean
}

export const usePatients = (): IUsePatientsReturn => {
	const [patients, setPatients] = useState<IPatient[]>([])
	const [patientsCount, setPatientsCount] = useState<number | null>(null)
	const [patientToSearch, setPatientToSearch] = useState<string>('')
	const [debouncedPatientToSearch, setDebouncedPatientToSearch] =
		useState<string>('')
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false)
	const [patientModalType, setPatientModalType] = useState<'create' | 'edit'>(
		'create'
	)
	const [selectedPatient, setSelectedPatient] = useState<IPatient | null>(null)
	const [isPatientModalLoading, setIsPatientModalLoading] =
		useState<boolean>(false)
	const [isDeletePatientModalOpen, setIsDeletePatientModalOpen] =
		useState<boolean>(false)
	const [selectedPatientToDelete, setSelectedPatientToDelete] =
		useState<IPatient | null>(null)
	const [isDeletingPatient, setIsDeletingPatient] = useState<boolean>(false)

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

	const fetchPatients = () => {
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

	const handlePatientSubmit = async (
		data:
			| Omit<IPatient, 'id'>
			| { patientId: number; patientData: Partial<IPatient> }
	) => {
		if (!data) return

		setIsPatientModalLoading(true)

		if ('patientId' in data) {
			updatePatient({
				patientId: data.patientId,
				patientData: data.patientData,
			})
				.then(response => {
					setPatients(prevPatients =>
						prevPatients.map(patient =>
							patient.id === data.patientId ? response : patient
						)
					)
					cachedPatients.current = {}

					setIsPatientModalOpen(false)
					setSelectedPatient(null)
					toast.success('Paciente actualizado exitosamente')
				})
				.catch(() =>
					toast.error('Ha ocurrido un error al actualizar el paciente')
				)
				.finally(() => setIsPatientModalLoading(false))
		} else {
			createPatient({
				patientData: data as IPatient,
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

					setIsPatientModalOpen(false)
					toast.success('Paciente creado exitosamente')
				})
				.catch(error => {
					const errorMessage = error.response.data.detail

					if (errorMessage === 'User with this identification already exists') {
						toast.error(
							'Ya existe un paciente con el número de identificación digitado'
						)
					} else {
						toast.error('Ha ocurrido un error al crear el paciente')
					}
				})
				.finally(() => setIsPatientModalLoading(false))
		}
	}

	const handleDeletePatient = async (patientId: number) => {
		if (!patientId) return

		setIsDeletingPatient(true)

		deletePatient({
			patientId,
		})
			.then(() => {
				setPatients(prevPatients =>
					prevPatients.filter(patient => patient.id !== patientId)
				)
				setPatientsCount(prevPatientsCount =>
					prevPatientsCount ? prevPatientsCount - 1 : 0
				)
				cachedPatients.current = {}

				const remainingPatients = patients.filter(
					patient => patient.id !== patientId
				)

				if (remainingPatients.length === 0 && currentPage > 1) {
					setCurrentPage(currentPage - 1)
				}

				setIsDeletePatientModalOpen(false)
				setSelectedPatientToDelete(null)
				toast.success('Paciente eliminado exitosamente')
			})
			.catch(() => toast.error('Ha ocurrido un error al eliminar el paciente'))
			.finally(() => setIsDeletingPatient(false))
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
		isPatientModalOpen,
		setIsPatientModalOpen,
		patientModalType,
		setPatientModalType,
		selectedPatient,
		setSelectedPatient,
		handlePatientSubmit,
		isPatientModalLoading,
		isDeletePatientModalOpen,
		setIsDeletePatientModalOpen,
		selectedPatientToDelete,
		setSelectedPatientToDelete,
		handleDeletePatient,
		isDeletingPatient,
	}
}
