import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { IPatient } from '@interfaces'

import { IcChevron, IcSpinner } from '@components/atoms'

const handlePageChange = ({
	page,
	totalPages,
	setCurrentPage,
}: {
	page: number
	totalPages: number
	setCurrentPage: Dispatch<SetStateAction<number>>
}) => {
	if (page > 0 && page <= totalPages) {
		setCurrentPage(page)
	}
}

const dynamicPagination = ({
	currentPage,
	totalPages,
	setCurrentPage,
}: {
	currentPage: number
	totalPages: number
	setCurrentPage: Dispatch<SetStateAction<number>>
}) => {
	const maxPagesToShow = 5
	const startPage = Math.max(
		Math.min(
			currentPage - Math.floor(maxPagesToShow / 2),
			totalPages - maxPagesToShow + 1
		),
		1
	)
	const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages)

	const pageSetToDisplay = Array.from(
		{ length: endPage - startPage + 1 },
		(_, idx) => startPage + idx
	)

	const paginationItems = pageSetToDisplay.map(pageNumber => (
		<li
			key={pageNumber}
			className={`${
				currentPage === pageNumber
					? 'bg-primary text-white'
					: 'hover:bg-gray-100'
			}`}
			onClick={() =>
				handlePageChange({ page: pageNumber, totalPages, setCurrentPage })
			}
		>
			{pageNumber}
		</li>
	))

	if (endPage < totalPages) {
		paginationItems.push(
			<li key='dots' className='!cursor-default'>
				...
			</li>
		)
		paginationItems.push(
			<li
				key={totalPages}
				className={`hover:text-primary hover:bg-primary/5 ${
					currentPage === totalPages ? 'text-tertiary bg-primary' : ''
				}`}
				onClick={() =>
					handlePageChange({ page: totalPages, totalPages, setCurrentPage })
				}
			>
				{totalPages}
			</li>
		)
	}

	return paginationItems
}

interface IPatientsTableProps {
	patients: IPatient[]
	patientsCount: number
	patientsPerPage: number
	currentPage: number
	setCurrentPage: Dispatch<SetStateAction<number>>
	visiblePages: IPatient[]
	setVisiblePages: Dispatch<SetStateAction<IPatient[]>>
	isLoading: boolean
}

export const PatientsTable = ({
	patients,
	patientsCount,
	patientsPerPage,
	currentPage,
	setCurrentPage,
	visiblePages,
	setVisiblePages,
	isLoading,
}: IPatientsTableProps) => {
	const [totalPages, setTotalPages] = useState<number>(1)

	useEffect(() => {
		if (patientsCount) {
			setTotalPages(Math.ceil(patientsCount / patientsPerPage))
		}
	}, [patientsCount])

	useEffect(() => {
		const startIndexOfCurrentPageSet = (currentPage - 1) * patientsPerPage
		const endIndexOfCurrentPageSet =
			startIndexOfCurrentPageSet + patientsPerPage

		setVisiblePages(
			patients.slice(startIndexOfCurrentPageSet, endIndexOfCurrentPageSet)
		)
	}, [currentPage, patients])

	return (
		<section className='flex size-full flex-col items-center'>
			<div className='h-[90%] min-h-[300px] w-full overflow-auto rounded-md bg-white shadow-lg'>
				<table className='w-full text-[15px] text-nowrap'>
					<thead className='sticky top-0'>
						<tr className='bg-gray-50 px-4 text-left font-medium text-[#111928] *:p-4'>
							<th className='rounded-tl-md'>Nombre completo</th>
							<th>Identificación</th>
							<th>Género</th>
							<th>Dirección</th>
							<th>Teléfono</th>
							<th>Convenio</th>
							<th className='rounded-tr-md'>Acciones</th>
						</tr>
					</thead>
					<tbody className='h-full divide-y divide-gray-200 bg-white'>
						{isLoading ? (
							<tr>
								<td colSpan={7} className='h-full p-4 align-top'>
									<IcSpinner className='mx-auto size-5 animate-spin fill-black' />
								</td>
							</tr>
						) : visiblePages.length > 0 ? (
							visiblePages.map((patient, idx) => (
								<tr
									key={`${patient.id}-${idx}`}
									className='capitalize *:p-4 hover:bg-gray-100'
								>
									<td className='cursor-pointer hover:underline'>
										{patient.name || '----'} {patient.last_name || '----'}
									</td>
									<td>{patient.identification || '----'}</td>
									<td>
										{patient.gender === 'M'
											? 'Masculino'
											: patient.gender === 'F'
												? 'Femenino'
												: '----'}
									</td>
									<td>{patient.address || '----'}</td>
									<td>{patient.phone || '----'}</td>
									<td>{patient.type || '----'}</td>
									<td></td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className='h-full p-4 align-top'>
									No se encontraron pacientes registrados.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{totalPages > 1 && (
				<ul className='mt-5 flex min-h-12 max-w-[80%] items-center justify-between gap-x-3.5 overflow-x-auto overflow-y-hidden rounded-md bg-white px-4 py-2.5 text-black shadow-lg *:flex *:size-6 *:shrink-0 *:items-center *:justify-center *:rounded *:hover:cursor-pointer'>
					<li
						className={`hover:bg-gray-100 ${
							currentPage === 1 && '!cursor-not-allowed opacity-50'
						}`}
						onClick={() =>
							handlePageChange({
								page: currentPage - 1,
								totalPages,
								setCurrentPage,
							})
						}
					>
						<IcChevron className='size-3.5 -rotate-90 fill-black' />
					</li>
					{dynamicPagination({ currentPage, totalPages, setCurrentPage })}
					<li
						className={`hover:bg-gray-100 ${
							currentPage === totalPages && '!cursor-not-allowed opacity-50'
						}`}
						onClick={() =>
							handlePageChange({
								page: currentPage + 1,
								totalPages,
								setCurrentPage,
							})
						}
					>
						<IcChevron className='size-3.5 rotate-90 fill-black' />
					</li>
				</ul>
			)}
		</section>
	)
}
