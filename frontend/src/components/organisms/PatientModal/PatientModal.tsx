import { FormEvent, useEffect, useState } from 'react'

import { IPatient } from '@interfaces'

import { Button, Input, Select } from '@components/atoms'

const getButtonText = ({
	type,
	isLoading,
}: {
	type: 'create' | 'edit'
	isLoading: boolean
}): string => {
	if (type === 'create') {
		return isLoading ? 'Creando Paciente...' : 'Crear Paciente'
	} else {
		return isLoading ? 'Actualizando Paciente...' : 'Actualizar Paciente'
	}
}

const genderOptions = [
	{ value: 'M', label: 'Masculino' },
	{ value: 'F', label: 'Femenino' },
]

const agreementOptions = [
	{ value: 'Particular', label: 'Particular' },
	{ value: 'SOAT', label: 'SOAT' },
]

interface IPatientModalProps {
	type: 'create' | 'edit'
	patient?: IPatient
	isLoading: boolean
	onSubmit: (
		patientData:
			| Omit<IPatient, 'id'>
			| { patientId: number; patientData: Partial<IPatient> }
	) => Promise<void>
}

export const PatientModal = ({
	type,
	patient,
	isLoading,
	onSubmit,
}: IPatientModalProps) => {
	const [patientData, setPatientData] = useState({
		name: '',
		last_name: '',
		identification: '',
		gender: '',
		address: '',
		phone: '',
		type: '' as 'Particular' | 'SOAT' | '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (type === 'edit' && patient) {
			setPatientData({
				name: patient.name || '',
				last_name: patient.last_name || '',
				identification: patient.identification || '',
				gender: patient.gender || '',
				address: patient.address || '',
				phone: patient.phone || '',
				type: patient.type || '',
			})
		} else if (type === 'create' && !patient) {
			setPatientData({
				name: '',
				last_name: '',
				identification: '',
				gender: '',
				address: '',
				phone: '',
				type: '',
			})
		}
	}, [type, patient])

	const validateForm = (): boolean => {
		const fieldsErrors: Record<string, string> = {}

		if (!patientData.name.trim()) {
			fieldsErrors.name = 'El nombre es requerido.'
		}

		if (!patientData.last_name.trim()) {
			fieldsErrors.last_name = 'El apellido es requerido.'
		}

		if (!patientData.identification.trim()) {
			fieldsErrors.identification = 'La identificación es requerida.'
		}

		if (!patientData.gender) {
			fieldsErrors.gender = 'El género es requerido.'
		}

		if (!patientData.address.trim()) {
			fieldsErrors.address = 'La dirección es requerida.'
		}

		if (!patientData.phone.trim()) {
			fieldsErrors.phone = 'El teléfono es requerido.'
		}

		if (!patientData.type) {
			fieldsErrors.type = 'El tipo de convenio es requerido.'
		}

		setErrors(fieldsErrors)
		return Object.keys(fieldsErrors).length === 0
	}

	const handleFieldChange = (field: string, value: string) => {
		setPatientData(prevPatientData => ({
			...prevPatientData,
			[field]: value,
		}))

		if (errors[field]) {
			setErrors(prevErrors => ({ ...prevErrors, [field]: '' }))
		}
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()

		if (!validateForm()) return

		const patientPayload = {
			name: patientData.name.trim(),
			last_name: patientData.last_name.trim(),
			identification: patientData.identification.trim(),
			gender: patientData.gender,
			address: patientData.address.trim(),
			phone: patientData.phone.trim(),
			type: patientData.type as 'Particular' | 'SOAT',
		}

		if (type === 'create') {
			onSubmit(patientPayload).then(() => {
				setPatientData({
					name: '',
					last_name: '',
					identification: '',
					gender: '',
					address: '',
					phone: '',
					type: '',
				})
				setErrors({})
			})
		} else if (type === 'edit' && patient) {
			onSubmit({
				patientId: patient.id,
				patientData: patientPayload,
			}).then(() => setErrors({}))
		}
	}

	return (
		<form className='mt-5'>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Nombre'
						placeholder='Ingrese el nombre'
						value={patientData.name}
						onChange={value => handleFieldChange('name', value)}
						disabled={isLoading}
						required
					/>
					{errors.name && <p className='text-xs text-red-500'>{errors.name}</p>}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Apellido'
						placeholder='Ingrese el apellido'
						value={patientData.last_name}
						onChange={value => handleFieldChange('last_name', value)}
						disabled={isLoading}
						required
					/>
					{errors.last_name && (
						<p className='text-xs text-red-500'>{errors.last_name}</p>
					)}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Identificación'
						placeholder='Ingrese la identificación'
						value={patientData.identification}
						onChange={value => handleFieldChange('identification', value)}
						disabled={isLoading}
						required
					/>
					{errors.identification && (
						<p className='text-xs text-red-500'>{errors.identification}</p>
					)}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Select
						label='Género'
						placeholder='Seleccione el género'
						options={genderOptions}
						value={patientData.gender}
						onChange={value => handleFieldChange('gender', value)}
						disabled={isLoading}
						required
					/>
					{errors.gender && (
						<p className='text-xs text-red-500'>{errors.gender}</p>
					)}
				</fieldset>
				<fieldset className='flex flex-col gap-1 md:col-span-2'>
					<Input
						type='text'
						label='Dirección'
						placeholder='Ingrese la dirección'
						value={patientData.address}
						onChange={value => handleFieldChange('address', value)}
						disabled={isLoading}
						required
					/>
					{errors.address && (
						<p className='text-xs text-red-500'>{errors.address}</p>
					)}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='tel'
						label='Teléfono'
						placeholder='Ingrese el teléfono'
						value={patientData.phone}
						onChange={value => handleFieldChange('phone', value)}
						disabled={isLoading}
						required
					/>
					{errors.phone && (
						<p className='text-xs text-red-500'>{errors.phone}</p>
					)}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Select
						label='Tipo de Convenio'
						placeholder='Seleccione el tipo'
						options={agreementOptions}
						value={patientData.type}
						onChange={value => handleFieldChange('type', value)}
						disabled={isLoading}
						required
					/>
					{errors.type && <p className='text-xs text-red-500'>{errors.type}</p>}
				</fieldset>
			</div>
			<footer className='flex justify-end gap-3 pt-4'>
				<Button
					text={getButtonText({ type, isLoading })}
					onClick={handleSubmit}
					disabled={isLoading}
				/>
			</footer>
		</form>
	)
}
