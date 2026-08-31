import { FormEvent, useEffect, useState } from 'react'

import { IMedicalRecord, IPatient } from '@interfaces'

import { Button, Input } from '@components/atoms'
import DatePicker from 'react-datepicker'

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
		date: new Date(),
		user_age: '',
		diagnosis: '',
		sessions: '',
		consultation_reason: '',
		report: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (medicalRecord && isEdit) {
			const parseDate = (dateString: string): Date => {
				if (!dateString) return new Date()

				const dateParts = dateString.split('T')[0].split('-')

				if (dateParts.length === 3) {
					const year = parseInt(dateParts[0])
					const month = parseInt(dateParts[1]) - 1
					const day = parseInt(dateParts[2])
					return new Date(year, month, day)
				}

				return new Date(dateString)
			}

			setMedicalRecordData({
				date: parseDate(medicalRecord.date || ''),
				user_age: medicalRecord.user_age?.toString() || '',
				diagnosis: medicalRecord.diagnosis || '',
				sessions: medicalRecord.sessions?.toString() || '',
				consultation_reason: medicalRecord.consultation_reason || '',
				report: medicalRecord.report || '',
			})
		}
	}, [medicalRecord, isEdit])

	const validateForm = (): boolean => {
		const fieldsErrors: Record<string, string> = {}

		if (!medicalRecordData.date) {
			fieldsErrors.date = 'La fecha es requerida.'
		}

		if (!medicalRecordData.user_age.trim()) {
			fieldsErrors.user_age = 'La edad es requerida.'
		}

		if (!medicalRecordData.sessions.trim()) {
			fieldsErrors.sessions = 'El número de sesiones es requerido.'
		}

		if (!medicalRecordData.diagnosis.trim()) {
			fieldsErrors.diagnosis = 'El diagnóstico es requerido.'
		}

		if (!medicalRecordData.consultation_reason.trim()) {
			fieldsErrors.consultation_reason = 'El motivo de consulta es requerido.'
		}

		if (patient.type === 'Particular' && !medicalRecordData.report.trim()) {
			fieldsErrors.report = 'El informe final es requerido.'
		}

		setErrors(fieldsErrors)
		return Object.keys(fieldsErrors).length === 0
	}

	const handleFieldChange = (field: string, value: string | Date) => {
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

		const formatDateToISO = (date: Date): string => {
			const year = date.getFullYear()
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const day = date.getDate().toString().padStart(2, '0')
			return `${year}-${month}-${day}`
		}

		const medicalRecordPayload = {
			date: formatDateToISO(medicalRecordData.date),
			user_age: parseInt(medicalRecordData.user_age.trim()),
			diagnosis: medicalRecordData.diagnosis.trim(),
			sessions: parseInt(medicalRecordData.sessions.trim()),
			consultation_reason: medicalRecordData.consultation_reason.trim(),
			report: medicalRecordData.report.trim(),
		}

		onSubmit(medicalRecordPayload).then(() => {
			if (!isEdit) {
				setMedicalRecordData({
					date: new Date(),
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
					<label className='text-sm font-medium text-black'>
						Fecha
						<span className='ml-1 text-red-500'>*</span>
					</label>
					<DatePicker
						className='focus:border-primary-light focus:ring-primary-light h-10 min-w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						selected={medicalRecordData.date}
						onChange={date => handleFieldChange('date', date || new Date())}
						placeholderText='Día/mes/año'
						dateFormat='dd/MM/yyyy'
						maxDate={new Date()}
						required
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
						required
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
						required
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
						required
					/>
					{errors.diagnosis && (
						<p className='text-xs text-red-500'>{errors.diagnosis}</p>
					)}
				</fieldset>
			</div>
			<div className='mt-4'>
				<fieldset className='flex flex-col gap-1'>
					<label className='text-sm font-medium text-black'>
						Motivo de Consulta
						<span className='ml-1 text-red-500'>*</span>
					</label>
					<textarea
						className='focus:border-primary-light focus:ring-primary-light min-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						placeholder='Describe el motivo de la consulta'
						value={medicalRecordData.consultation_reason}
						onChange={event =>
							handleFieldChange('consultation_reason', event.target.value)
						}
						disabled={isLoading}
						rows={3}
						required
					/>
					{errors.consultation_reason && (
						<p className='text-xs text-red-500'>{errors.consultation_reason}</p>
					)}
				</fieldset>
			</div>
			{patient.type === 'Particular' && (
				<div className='mt-4'>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>
							Informe Final <span className='ml-1 text-red-500'>*</span>
						</label>
						<textarea
							className='focus:border-primary-light focus:ring-primary-light min-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
							placeholder='Escribe el informe final'
							value={medicalRecordData.report}
							onChange={event =>
								handleFieldChange('report', event.target.value)
							}
							disabled={isLoading}
							rows={6}
							required
						/>
						{errors.report && (
							<p className='text-xs text-red-500'>{errors.report}</p>
						)}
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
