import { FormEvent, useState } from 'react'

import { IPatient } from '@interfaces'

import { Button, Input, Select } from '@components/atoms'

const genderOptions = [
	{ value: 'M', label: 'Masculino' },
	{ value: 'F', label: 'Femenino' },
]

const agreementOptions = [
	{ value: 'Particular', label: 'Particular' },
	{ value: 'SOAT', label: 'SOAT' },
]

interface ICreatePatientModalProps {
	isCreatingPatient: boolean
	createNewPatient: (newPatientData: Omit<IPatient, 'id'>) => Promise<void>
}

export const CreatePatientModal = ({
	isCreatingPatient,
	createNewPatient,
}: ICreatePatientModalProps) => {
	const [newPatientData, setNewPatientData] = useState({
		name: '',
		last_name: '',
		identification: '',
		gender: '',
		address: '',
		phone: '',
		type: '' as 'Particular' | 'SOAT' | '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateForm = (): boolean => {
		const fieldsErrors: Record<string, string> = {}

		if (!newPatientData.name.trim()) {
			fieldsErrors.name = 'El nombre es requerido.'
		}

		if (!newPatientData.last_name.trim()) {
			fieldsErrors.last_name = 'El apellido es requerido.'
		}

		if (!newPatientData.identification.trim()) {
			fieldsErrors.identification = 'La identificación es requerida.'
		}

		if (!newPatientData.gender) {
			fieldsErrors.gender = 'El género es requerido.'
		}

		if (!newPatientData.address.trim()) {
			fieldsErrors.address = 'La dirección es requerida.'
		}

		if (!newPatientData.phone.trim()) {
			fieldsErrors.phone = 'El teléfono es requerido.'
		}

		if (!newPatientData.type) {
			fieldsErrors.type = 'El tipo de convenio es requerido.'
		}

		setErrors(fieldsErrors)
		return Object.keys(fieldsErrors).length === 0
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()

		if (!validateForm()) return

		createNewPatient({
			name: newPatientData.name.trim(),
			last_name: newPatientData.last_name.trim(),
			identification: newPatientData.identification.trim(),
			gender: newPatientData.gender,
			address: newPatientData.address.trim(),
			phone: newPatientData.phone.trim(),
			type: newPatientData.type as 'Particular' | 'SOAT',
		}).then(() => {
			setNewPatientData({
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
	}

	const handleFieldChange = (field: string, value: string) => {
		setNewPatientData(prevNewPatientData => ({
			...prevNewPatientData,
			[field]: value,
		}))

		if (errors[field]) {
			setErrors(prevErrors => ({ ...prevErrors, [field]: '' }))
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
						value={newPatientData.name}
						onChange={value => handleFieldChange('name', value)}
						disabled={isCreatingPatient}
						required
					/>
					{errors.name && <p className='text-xs text-red-500'>{errors.name}</p>}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Apellido'
						placeholder='Ingrese el apellido'
						value={newPatientData.last_name}
						onChange={value => handleFieldChange('last_name', value)}
						disabled={isCreatingPatient}
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
						value={newPatientData.identification}
						onChange={value => handleFieldChange('identification', value)}
						disabled={isCreatingPatient}
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
						value={newPatientData.gender}
						onChange={value => handleFieldChange('gender', value)}
						disabled={isCreatingPatient}
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
						value={newPatientData.address}
						onChange={value => handleFieldChange('address', value)}
						disabled={isCreatingPatient}
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
						value={newPatientData.phone}
						onChange={value => handleFieldChange('phone', value)}
						disabled={isCreatingPatient}
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
						value={newPatientData.type}
						onChange={value => handleFieldChange('type', value)}
						disabled={isCreatingPatient}
						required
					/>
					{errors.type && <p className='text-xs text-red-500'>{errors.type}</p>}
				</fieldset>
			</div>
			<footer className='flex justify-end gap-3 pt-4'>
				<Button
					text={isCreatingPatient ? 'Creando Paciente...' : 'Crear Paciente'}
					onClick={handleSubmit}
					disabled={isCreatingPatient}
				/>
			</footer>
		</form>
	)
}
