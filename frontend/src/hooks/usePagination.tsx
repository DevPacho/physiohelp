import { Dispatch, ReactElement, SetStateAction } from 'react'

interface IUsePaginationProps {
	currentPage: number
	setCurrentPage: Dispatch<SetStateAction<number>>
	totalPages: number
}

interface IUsePaginationReturn {
	handlePageChange: (page: number) => void
	renderPaginationItems: () => ReactElement[]
	canGoPreviousPage: boolean
	canGoNextPage: boolean
}

export const usePagination = ({
	currentPage,
	setCurrentPage,
	totalPages,
}: IUsePaginationProps): IUsePaginationReturn => {
	const handlePageChange = (page: number) => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page)
		}
	}

	const renderPaginationItems = (): ReactElement[] => {
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
				onClick={() => handlePageChange(pageNumber)}
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
					onClick={() => handlePageChange(totalPages)}
				>
					{totalPages}
				</li>
			)
		}

		return paginationItems
	}

	const canGoPreviousPage = currentPage > 1
	const canGoNextPage = currentPage < totalPages

	return {
		handlePageChange,
		renderPaginationItems,
		canGoPreviousPage,
		canGoNextPage,
	}
}
