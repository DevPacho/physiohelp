import { FormEvent, useEffect, useState } from 'react'

import { IMedicalRecord, IPatient } from '@interfaces'

import { Button, Input } from '@components/atoms'

const getButtonText = ({
	type,
	isLoading,
	patientType,
}: {
	type: 'create' | 'edit'
	isLoading: boolean
	patientType: 'SOAT' | 'Particular'
}): string => {
	if (type === 'create') {
		return isLoading
			? `Creando ${patientType === 'Particular' ? 'Informe Final' : 'Historia Clínica'}...`
			: `Crear ${patientType === 'Particular' ? 'Informe Final' : 'Historia Clínica'}`
	} else {
		return isLoading
			? `Actualizando ${patientType === 'Particular' ? 'Informe Final' : 'Historia Clínica'}...`
			: `Actualizar ${patientType === 'Particular' ? 'Informe Final' : 'Historia Clínica'}`
	}
}

interface IMedicalRecordModalProps {
	patient: IPatient
	medicalRecord?: IMedicalRecord | null
	isLoading: boolean
	isEdit?: boolean
	onSubmit: (medicalRecordData: Partial<IMedicalRecord>) => Promise<void>
}

export const MedicalRecordModal = ({
	patient,
	medicalRecord,
	isLoading,
	isEdit,
	onSubmit,
}: IMedicalRecordModalProps) => {
	const [medicalRecordData, setMedicalRecordData] = useState({
		date: '',
		user_age: '',
		diagnosis: '',
		sessions: '',
		consultation_reason: '',
		report: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (medicalRecord && isEdit) {
			setMedicalRecordData({
				date: medicalRecord.date || '',
				user_age: medicalRecord.user_age?.toString() || '',
				diagnosis: medicalRecord.diagnosis || '',
				sessions: medicalRecord.sessions?.toString() || '',
				consultation_reason: medicalRecord.consultation_reason || '',
				report: medicalRecord.report || '',
			})
		} else {
			const today = new Date()
			const formattedDate = today.toISOString().split('T')[0]

			setMedicalRecordData(prevMedicalRecordData => ({
				...prevMedicalRecordData,
				date: formattedDate,
			}))
		}
	}, [medicalRecord, isEdit])

	const validateForm = (): boolean => {
		const fieldsErrors: Record<string, string> = {}

		if (!medicalRecordData.date.trim()) {
			fieldsErrors.date = 'La fecha es requerida.'
		}

		if (!medicalRecordData.user_age.trim()) {
			fieldsErrors.user_age = 'La edad es requerida.'
		}

		if (!medicalRecordData.sessions.trim()) {
			fieldsErrors.sessions = 'El número de sesiones es requerido.'
		}

		setErrors(fieldsErrors)
		return Object.keys(fieldsErrors).length === 0
	}

	const handleFieldChange = (field: string, value: string) => {
		setMedicalRecordData(prevMedicalRecordData => ({
			...prevMedicalRecordData,
			[field]: value,
		}))

		if (errors[field]) {
			setErrors(prevErrors => ({ ...prevErrors, [field]: '' }))
		}
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()

		if (!validateForm()) return

		const medicalRecordPayload = {
			date: medicalRecordData.date.trim(),
			user_age: parseInt(medicalRecordData.user_age.trim()),
			diagnosis: medicalRecordData.diagnosis.trim(),
			sessions: parseInt(medicalRecordData.sessions.trim()),
			consultation_reason: medicalRecordData.consultation_reason.trim(),
			report: medicalRecordData.report.trim(),
		}

		onSubmit(medicalRecordPayload).then(() => {
			if (!isEdit) {
				setMedicalRecordData({
					date: '',
					user_age: '',
					diagnosis: '',
					sessions: '',
					consultation_reason: '',
					report: '',
				})
			}
			setErrors({})
		})
	}

	return (
		<form className='mt-5'>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Fecha'
						placeholder='Fecha de la consulta'
						value={medicalRecordData.date}
						onChange={value => handleFieldChange('date', value)}
						disabled={isLoading}
					/>
					{errors.date && <p className='text-xs text-red-500'>{errors.date}</p>}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Edad del Paciente'
						placeholder='Edad en años'
						value={medicalRecordData.user_age}
						onChange={value => handleFieldChange('user_age', value)}
						disabled={isLoading}
					/>
					{errors.user_age && (
						<p className='text-xs text-red-500'>{errors.user_age}</p>
					)}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Número de Sesiones'
						placeholder='Número de sesiones'
						value={medicalRecordData.sessions}
						onChange={value => handleFieldChange('sessions', value)}
						disabled={isLoading}
					/>
					{errors.sessions && (
						<p className='text-xs text-red-500'>{errors.sessions}</p>
					)}
				</fieldset>
			</div>
			<div className='mt-4'>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Diagnóstico'
						placeholder='Diagnóstico médico'
						value={medicalRecordData.diagnosis}
						onChange={value => handleFieldChange('diagnosis', value)}
						disabled={isLoading}
					/>
				</fieldset>
			</div>
			<div className='mt-4'>
				<fieldset className='flex flex-col gap-1'>
					<label className='text-sm font-medium text-black'>
						Motivo de Consulta
					</label>
					<textarea
						className='focus:border-primary-light focus:ring-primary-light min-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						placeholder='Describe el motivo de la consulta...'
						value={medicalRecordData.consultation_reason}
						onChange={event =>
							handleFieldChange('consultation_reason', event.target.value)
						}
						disabled={isLoading}
						rows={3}
					/>
				</fieldset>
			</div>
			{patient.type === 'Particular' && (
				<div className='mt-4'>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>
							Informe Final
						</label>
						<textarea
							className='focus:border-primary-light focus:ring-primary-light min-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
							placeholder='Escribe el informe final para el paciente particular...'
							value={medicalRecordData.report}
							onChange={event =>
								handleFieldChange('report', event.target.value)
							}
							disabled={isLoading}
							rows={6}
						/>
					</fieldset>
				</div>
			)}
			<footer className='flex justify-end gap-3 pt-4'>
				<Button
					text={getButtonText({
						type: isEdit ? 'edit' : 'create',
						isLoading,
						patientType: patient.type,
					})}
					onClick={handleSubmit}
					disabled={isLoading}
				/>
			</footer>
		</form>
	)
}
