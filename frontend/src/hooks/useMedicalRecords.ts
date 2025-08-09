import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import {
	createMedicalRecord,
	deleteMedicalRecord,
	generateAndDownloadMedicalRecordPdf,
	getMedicalRecordByPatientId,
	getPatientById,
	updateMedicalRecord,
} from '@api'

import { IMedicalRecord, IPatient } from '@interfaces'

import toast from 'react-hot-toast'

interface IUseMedicalRecordsReturn {
	isPatientLoading: boolean
	currentPatient: IPatient | null
	setCurrentPatient: Dispatch<SetStateAction<IPatient | null>>
	currentMedicalRecord: IMedicalRecord | null
	setCurrentMedicalRecord: Dispatch<SetStateAction<IMedicalRecord | null>>
	isMedicalRecordLoading: boolean
	isDownloadingPdf: boolean
	showMedicalRecordModal: boolean
	setShowMedicalRecordModal: Dispatch<SetStateAction<boolean>>
	showDeleteMedicalRecordModal: boolean
	setShowDeleteMedicalRecordModal: Dispatch<SetStateAction<boolean>>
	handleGenerateAndDownloadPdf: () => void
	handleMedicalRecordSubmit: (
		medicalRecordData: Partial<IMedicalRecord>
	) => Promise<void>
	isDeletingMedicalRecord: boolean
	handleDeleteMedicalRecord: (medicalRecordId: number) => Promise<void>
	activeTab: string
	setActiveTab: Dispatch<SetStateAction<string>>
}

export const useMedicalRecords = (
	patientId?: string
): IUseMedicalRecordsReturn => {
	const [isPatientLoading, setIsPatientLoading] = useState<boolean>(false)
	const [currentPatient, setCurrentPatient] = useState<IPatient | null>(null)
	const [currentMedicalRecord, setCurrentMedicalRecord] =
		useState<IMedicalRecord | null>(null)
	const [isMedicalRecordLoading, setIsMedicalRecordLoading] =
		useState<boolean>(false)
	const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false)
	const [showMedicalRecordModal, setShowMedicalRecordModal] =
		useState<boolean>(false)
	const [showDeleteMedicalRecordModal, setShowDeleteMedicalRecordModal] =
		useState<boolean>(false)
	const [isDeletingMedicalRecord, setIsDeletingMedicalRecord] =
		useState<boolean>(false)
	const [activeTab, setActiveTab] = useState<string>('medical-record')

	const patientIdNumber = Number(patientId)

	const fetchPatientById = (patientId: number) => {
		if (!patientId) return

		setIsPatientLoading(true)

		getPatientById({ patientId })
			.then(response => setCurrentPatient(response))
			.catch(() =>
				toast.error('Ha ocurrido un error al cargar los datos del paciente')
			)
			.finally(() => setIsPatientLoading(false))
	}

	const fetchMedicalRecordByUserId = (userId: number) => {
		if (!userId) return

		setIsMedicalRecordLoading(true)

		getMedicalRecordByPatientId({
			patientId: patientIdNumber,
		})
			.then((response: IMedicalRecord) => {
				if (response) {
					setCurrentMedicalRecord(response)
				} else {
					setCurrentMedicalRecord(null)
				}
			})
			.catch((error: any) => {
				if (
					error?.response?.status === 404 ||
					error?.message?.includes('404')
				) {
					setCurrentMedicalRecord(null)
				} else {
					toast.error(
						`Ha ocurrido un error al cargar ${
							currentPatient?.type === 'SOAT'
								? 'la historia clínica'
								: 'el informe final'
						} del paciente`
					)
				}
			})
			.finally(() => setIsMedicalRecordLoading(false))
	}

	const handleMedicalRecordSubmit = async (
		medicalRecordData: Partial<IMedicalRecord>
	) => {
		if (!currentPatient) return

		setIsMedicalRecordLoading(true)

		if (currentMedicalRecord) {
			updateMedicalRecord({
				medicalRecordId: currentMedicalRecord.id,
				medicalRecordData,
			})
				.then(response => {
					setCurrentMedicalRecord(response)
					setShowMedicalRecordModal(false)

					toast.success(
						`${currentPatient.type === 'SOAT' ? 'Historia clínica actualizada' : 'Informe final actualizado'} exitosamente`
					)
				})
				.catch(() =>
					toast.error(
						`Ha ocurrido un error al actualizar ${currentPatient.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}`
					)
				)
				.finally(() => setIsMedicalRecordLoading(false))
		} else {
			createMedicalRecord({
				patientId: patientIdNumber,
				medicalRecordData,
			})
				.then(response => {
					setCurrentMedicalRecord(response)
					setShowMedicalRecordModal(false)

					toast.success(
						`${currentPatient.type === 'SOAT' ? 'Historia clínica creada' : 'Informe final creado'} exitosamente`
					)
				})
				.catch(() =>
					toast.error(
						`Ha ocurrido un error al crear ${currentPatient.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}`
					)
				)
				.finally(() => setIsMedicalRecordLoading(false))
		}
	}

	const handleDeleteMedicalRecord = async (medicalRecordId: number) => {
		if (!medicalRecordId) return

		setIsDeletingMedicalRecord(true)

		deleteMedicalRecord({ medicalRecordId })
			.then(() => {
				setCurrentMedicalRecord(null)
				setShowDeleteMedicalRecordModal(false)
				toast.success(
					`${currentPatient?.type === 'SOAT' ? 'Historia clínica eliminada' : 'Informe final eliminado'} exitosamente`
				)
			})
			.catch(() =>
				toast.error(
					`Ha ocurrido un error al eliminar ${currentPatient?.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}`
				)
			)
			.finally(() => setIsDeletingMedicalRecord(false))
	}

	const handleGenerateAndDownloadPdf = () => {
		if (!currentPatient) return

		setIsDownloadingPdf(true)

		generateAndDownloadMedicalRecordPdf({
			patientId: currentPatient.id,
			patientFullName: `${currentPatient.name} ${currentPatient.last_name}`,
			agreementType:
				currentPatient.type === 'Particular'
					? 'Informe Final'
					: 'Historia Clínica',
			date: currentMedicalRecord?.date?.split('-').reverse().join('/') || '',
		})
			.then(() =>
				toast.success(
					`${currentPatient.type === 'SOAT' ? 'Historia clínica descargada' : 'Informe final descargado'} exitosamente`
				)
			)
			.catch(() =>
				toast.error(
					`Ha ocurrido un error al descargar ${currentPatient.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}`
				)
			)
			.finally(() => setIsDownloadingPdf(false))
	}

	useEffect(() => {
		if (patientId) {
			fetchPatientById(patientIdNumber)
		}
	}, [patientId])

	useEffect(() => {
		if (currentPatient) {
			fetchMedicalRecordByUserId(currentPatient.id)
		}
	}, [currentPatient])

	return {
		isPatientLoading,
		currentPatient,
		setCurrentPatient,
		currentMedicalRecord,
		setCurrentMedicalRecord,
		isMedicalRecordLoading,
		isDownloadingPdf,
		showMedicalRecordModal,
		setShowMedicalRecordModal,
		showDeleteMedicalRecordModal,
		setShowDeleteMedicalRecordModal,
		handleGenerateAndDownloadPdf,
		handleMedicalRecordSubmit,
		isDeletingMedicalRecord,
		handleDeleteMedicalRecord,
		activeTab,
		setActiveTab,
	}
}
