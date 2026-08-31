import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import {
	createEvolution,
	deleteEvolution,
	getEvolutions,
	getEvolutionsCount,
	updateEvolution,
} from '@api'

import { IEvolution } from '@interfaces'

import toast from 'react-hot-toast'

const evolutionsPerPage = 12

interface IUseEvolutionsReturn {
	evolutions: IEvolution[]
	setEvolutions: Dispatch<SetStateAction<IEvolution[]>>
	evolutionsCount: number | null
	evolutionsPerPage: number
	currentPage: number
	setCurrentPage: Dispatch<SetStateAction<number>>
	isLoading: boolean
	isEvolutionModalLoading: boolean
	showCreateEvolutionModal: boolean
	setShowCreateEvolutionModal: Dispatch<SetStateAction<boolean>>
	selectedEvolution: IEvolution | null
	setSelectedEvolution: Dispatch<SetStateAction<IEvolution | null>>
	handleEvolutionSubmit: (
		evolutionId: number | null,
		evolutionData: Partial<IEvolution>
	) => Promise<void>
	selectedEvolutionToDelete: IEvolution | null
	setSelectedEvolutionToDelete: Dispatch<SetStateAction<IEvolution | null>>
	handleDeleteEvolution: (evolutionId: number) => Promise<void>
	isDeletingEvolution: boolean
}

export const useEvolutions = (
	medicalRecordId?: number
): IUseEvolutionsReturn => {
	const [evolutions, setEvolutions] = useState<IEvolution[]>([])
	const [evolutionsCount, setEvolutionsCount] = useState<number | null>(null)
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isEvolutionModalLoading, setIsEvolutionModalLoading] =
		useState<boolean>(false)
	const [isDeletingEvolution, setIsDeletingEvolution] = useState<boolean>(false)
	const [showCreateEvolutionModal, setShowCreateEvolutionModal] =
		useState<boolean>(false)
	const [selectedEvolution, setSelectedEvolution] = useState<IEvolution | null>(
		null
	)
	const [selectedEvolutionToDelete, setSelectedEvolutionToDelete] =
		useState<IEvolution | null>(null)

	const cachedEvolutions = useRef<Record<string, IEvolution[]>>({})

	const recalculateEvolutionNumbers = (
		evolutions: IEvolution[],
		totalCount: number,
		currentPageNumber: number
	): IEvolution[] => {
		const offset = (currentPageNumber - 1) * evolutionsPerPage

		const evolutionsWithNumbers = evolutions.map(
			(evolution, evolutionIndex) => {
				const evolutionNumber = totalCount - (offset + evolutionIndex)

				return {
					...evolution,
					evolution_number: evolutionNumber,
				}
			}
		)

		return evolutionsWithNumbers
	}

	const fetchEvolutionsCount = async () => {
		if (!medicalRecordId) return

		getEvolutionsCount({ medicalRecordId })
			.then(response => setEvolutionsCount(response.count))
			.catch(() =>
				toast.error(
					'Ha ocurrido un error al cargar la cantidad total de evoluciones'
				)
			)
	}

	const fetchEvolutions = () => {
		if (!medicalRecordId) return

		const cacheKey = `${currentPage}-${medicalRecordId}`

		if (cachedEvolutions.current[cacheKey]) {
			setEvolutions(cachedEvolutions.current[cacheKey])
			return
		}

		setIsLoading(true)

		getEvolutions({
			medicalRecordId,
			skip: (currentPage - 1) * evolutionsPerPage,
			limit: evolutionsPerPage,
		})
			.then(response => {
				cachedEvolutions.current[cacheKey] = response
				setEvolutions(response)
			})
			.catch(() =>
				toast.error('Ha ocurrido un error al cargar las evoluciones')
			)
			.finally(() => setIsLoading(false))
	}

	const handleEvolutionSubmit = async (
		evolutionId: number | null,
		evolutionData: Partial<IEvolution>
	) => {
		if (!medicalRecordId) return

		setIsEvolutionModalLoading(true)

		if (evolutionId) {
			updateEvolution({
				evolutionId,
				evolutionData,
			})
				.then(response => {
					setEvolutions(prevEvolutions => {
						const updatedEvolutions = prevEvolutions.map(evolution =>
							evolution.id === evolutionId ? response : evolution
						)

						return evolutionsCount
							? recalculateEvolutionNumbers(
									updatedEvolutions,
									evolutionsCount,
									currentPage
								)
							: updatedEvolutions
					})
					cachedEvolutions.current = {}

					setSelectedEvolution(null)
					toast.success('Evolución actualizada exitosamente')
				})
				.catch(() =>
					toast.error('Ha ocurrido un error al actualizar la evolución')
				)
				.finally(() => setIsEvolutionModalLoading(false))
		} else {
			createEvolution({
				medicalRecordId,
				evolutionData,
			})
				.then(response => {
					const newEvolutionsCount = evolutionsCount ? evolutionsCount + 1 : 1

					setEvolutionsCount(newEvolutionsCount)

					if (currentPage !== 1) {
						setCurrentPage(1)
					} else {
						setEvolutions(prevEvolutions => {
							const newEvolutions = [response, ...prevEvolutions]
							const limitedEvolutions = newEvolutions.slice(
								0,
								evolutionsPerPage
							)

							return recalculateEvolutionNumbers(
								limitedEvolutions,
								newEvolutionsCount,
								1
							)
						})
					}
					cachedEvolutions.current = {}

					setShowCreateEvolutionModal(false)
					toast.success('Evolución creada exitosamente')
				})
				.catch(() => toast.error('Ha ocurrido un error al crear la evolución'))
				.finally(() => setIsEvolutionModalLoading(false))
		}
	}

	const handleDeleteEvolution = async (evolutionId: number) => {
		if (!evolutionId) return

		setIsDeletingEvolution(true)

		deleteEvolution({ evolutionId })
			.then(() => {
				const newEvolutionsCount = evolutionsCount ? evolutionsCount - 1 : 0

				setEvolutionsCount(newEvolutionsCount)

				const remainingEvolutions = evolutions.filter(
					evolution => evolution.id !== evolutionId
				)

				if (remainingEvolutions.length === 0 && currentPage > 1) {
					setCurrentPage(currentPage - 1)
				} else {
					setEvolutions(() => {
						return newEvolutionsCount > 0
							? recalculateEvolutionNumbers(
									remainingEvolutions,
									newEvolutionsCount,
									currentPage
								)
							: remainingEvolutions
					})
				}
				cachedEvolutions.current = {}

				setSelectedEvolutionToDelete(null)
				toast.success('Evolución eliminada exitosamente')
			})
			.catch(() => toast.error('Ha ocurrido un error al eliminar la evolución'))
			.finally(() => setIsDeletingEvolution(false))
	}

	useEffect(() => {
		if (medicalRecordId) {
			fetchEvolutionsCount()
		}
	}, [medicalRecordId])

	useEffect(() => {
		if (medicalRecordId) {
			fetchEvolutions()
		}
	}, [currentPage, medicalRecordId])

	return {
		evolutions,
		setEvolutions,
		evolutionsCount,
		evolutionsPerPage,
		currentPage,
		setCurrentPage,
		isLoading,
		isEvolutionModalLoading,
		showCreateEvolutionModal,
		setShowCreateEvolutionModal,
		selectedEvolution,
		setSelectedEvolution,
		handleEvolutionSubmit,
		selectedEvolutionToDelete,
		setSelectedEvolutionToDelete,
		handleDeleteEvolution,
		isDeletingEvolution,
	}
}
