import { FormEvent, useEffect, useState } from 'react'

import { IEvolution } from '@interfaces'

import { Button, Input } from '@components/atoms'

const getButtonText = ({
	type,
	isLoading,
}: {
	type: 'create' | 'edit'
	isLoading: boolean
}): string => {
	if (type === 'create') {
		return isLoading ? 'Creando Evolución...' : 'Crear Evolución'
	} else {
		return isLoading ? 'Actualizando Evolución...' : 'Actualizar Evolución'
	}
}

interface IEvolutionModalProps {
	evolution?: IEvolution | null
	isLoading: boolean
	isEdit?: boolean
	onSubmit: (
		evolutionData: Partial<IEvolution>
	) => Promise<void>
}

export const EvolutionModal = ({
	evolution,
	isLoading,
	isEdit,
	onSubmit,
}: IEvolutionModalProps) => {
	const [evolutionData, setEvolutionData] = useState({
		date: '',
		observations: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (evolution && isEdit) {
			setEvolutionData({
				date: evolution.date || '',
				observations: evolution.observations || '',
			})
		} else {
			const today = new Date()
			const formattedDate = today.toISOString().split('T')[0]

			setEvolutionData({
				date: formattedDate,
				observations: '',
			})
		}
	}, [evolution, isEdit])

	const validateForm = (): boolean => {
		const fieldsErrors: Record<string, string> = {}

		if (!evolutionData.date.trim()) {
			fieldsErrors.date = 'La fecha es requerida.'
		}

		if (!evolutionData.observations.trim()) {
			fieldsErrors.observations = 'Las observaciones son requeridas.'
		}

		setErrors(fieldsErrors)
		return Object.keys(fieldsErrors).length === 0
	}

	const handleFieldChange = (field: string, value: string) => {
		setEvolutionData(prevEvolutionData => ({
			...prevEvolutionData,
			[field]: value,
		}))

		if (errors[field]) {
			setErrors(prevErrors => ({ ...prevErrors, [field]: '' }))
		}
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()

		if (!validateForm()) return

		const evolutionPayload = {
			date: evolutionData.date,
			observations: evolutionData.observations.trim(),
		}

		onSubmit(evolutionPayload).then(() => {
			if (!isEdit) {
				setEvolutionData({
					date: '',
					observations: '',
				})
			}
			setErrors({})
		})
	}

	return (
		<form className='mt-5'>
			<div className='grid grid-cols-1 gap-4'>
				<fieldset className='flex flex-col gap-1'>
					<Input
						type='text'
						label='Fecha de la Evolución'
						placeholder='DD/MM/YYYY'
						value={evolutionData.date}
						onChange={value => handleFieldChange('date', value)}
						disabled={isLoading}
						required
					/>
					{errors.date && <p className='text-xs text-red-500'>{errors.date}</p>}
				</fieldset>
				<fieldset className='flex flex-col gap-1'>
					<label className='text-sm font-medium text-black'>
						Observaciones
						<span className='ml-1 text-red-500'>*</span>
					</label>
					<textarea
						className='focus:border-primary-light focus:ring-primary-light min-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						placeholder='Describe las observaciones de esta evolución...'
						value={evolutionData.observations}
						onChange={event =>
							handleFieldChange('observations', event.target.value)
						}
						disabled={isLoading}
						required
						rows={6}
					/>
					{errors.observations && (
						<p className='text-xs text-red-500'>{errors.observations}</p>
					)}
				</fieldset>
				<footer className='flex justify-end gap-3 pt-4'>
					<Button
						text={getButtonText({
							type: isEdit ? 'edit' : 'create',
							isLoading,
						})}
						onClick={handleSubmit}
						disabled={isLoading}
					/>
				</footer>
			</div>
		</form>
	)
}
