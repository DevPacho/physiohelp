import { FormEvent, useEffect, useState } from 'react'

import { IEvolution } from '@interfaces'

import { Button } from '@components/atoms'
import DatePicker from 'react-datepicker'

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
	onSubmit: (evolutionData: Partial<IEvolution>) => Promise<void>
}

export const EvolutionModal = ({
	evolution,
	isLoading,
	isEdit,
	onSubmit,
}: IEvolutionModalProps) => {
	const [evolutionData, setEvolutionData] = useState({
		date: new Date(),
		observations: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (evolution && isEdit) {
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

			setEvolutionData({
				date: parseDate(evolution.date || ''),
				observations: evolution.observations || '',
			})
		}
	}, [evolution, isEdit])

	const validateForm = (): boolean => {
		const fieldsErrors: Record<string, string> = {}

		if (!evolutionData.date) {
			fieldsErrors.date = 'La fecha es requerida.'
		}

		if (!evolutionData.observations.trim()) {
			fieldsErrors.observations = 'Las observaciones son requeridas.'
		}

		setErrors(fieldsErrors)
		return Object.keys(fieldsErrors).length === 0
	}

	const handleFieldChange = (field: string, value: string | Date) => {
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

		const formatDateToISO = (date: Date): string => {
			const year = date.getFullYear()
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const day = date.getDate().toString().padStart(2, '0')
			return `${year}-${month}-${day}`
		}

		const evolutionPayload = {
			date: formatDateToISO(evolutionData.date),
			observations: evolutionData.observations.trim(),
		}

		onSubmit(evolutionPayload).then(() => {
			if (!isEdit) {
				setEvolutionData({
					date: new Date(),
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
					<label className='text-sm font-medium text-black'>
						Fecha
						<span className='ml-1 text-red-500'>*</span>
					</label>
					<DatePicker
						className='focus:border-primary-light focus:ring-primary-light h-10 min-w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						selected={evolutionData.date}
						onChange={date => handleFieldChange('date', date || new Date())}
						placeholderText='Día/mes/año'
						dateFormat='dd/MM/yyyy'
						maxDate={new Date()}
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
						placeholder='Describe las observaciones de esta evolución'
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
