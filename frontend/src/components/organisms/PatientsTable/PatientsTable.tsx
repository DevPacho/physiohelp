import { usePagination, usePatients } from '@hooks'

import { Button, IcChevron, IcSpinner, Input } from '@components/atoms'
import { Modal } from '@components/molecules'
import { CreatePatientModal } from '@components/organisms'

export const PatientsTable = () => {
	const {
		patients,
		patientsCount,
		patientsPerPage,
		patientToSearch,
		setPatientToSearch,
		currentPage,
		setCurrentPage,
		isLoading,
		isCreatePatientModalOpen,
		setIsCreatePatientModalOpen,
		createNewPatient,
		isCreatingPatient,
	} = usePatients()

	const totalPages = patientsCount
		? Math.ceil(patientsCount / patientsPerPage)
		: 1

	const {
		handlePageChange,
		renderPaginationItems,
		canGoPreviousPage,
		canGoNextPage,
	} = usePagination({
		currentPage,
		setCurrentPage,
		totalPages,
	})

	return (
		<section className='flex size-full flex-col items-center gap-5'>
			<header className='flex w-full flex-col justify-between gap-3 md:flex-row md:items-center'>
				<h2 className='min-w-fit text-xl font-semibold text-black'>
					Gestión de Pacientes
				</h2>
				<div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:justify-end'>
					<Input
						type='text'
						placeholder='Buscar pacientes...'
						value={patientToSearch}
						onChange={setPatientToSearch}
					/>
					<Button
						text='Nuevo Paciente'
						onClick={() => setIsCreatePatientModalOpen(true)}
					/>
				</div>
				<Modal
					title='Nuevo Paciente'
					subtitle='Diligencia todos los campos para crear un nuevo paciente.'
					isOpen={isCreatePatientModalOpen}
					onClose={() => setIsCreatePatientModalOpen(false)}
					modalContentClassName='w-full xl:min-w-[700px] xl:min-h-[300px] xl:w-fit'
				>
					<CreatePatientModal
						{...{
							isCreatingPatient,
							createNewPatient,
						}}
					/>
				</Modal>
			</header>
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
						) : patients.length > 0 ? (
							patients.map((patient, idx) => (
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
				<ul className='flex min-h-12 max-w-[80%] items-center justify-between gap-x-3.5 overflow-x-auto overflow-y-hidden rounded-md bg-white px-4 py-2.5 text-black shadow-lg *:flex *:size-6 *:shrink-0 *:items-center *:justify-center *:rounded *:hover:cursor-pointer'>
					<li
						className={`hover:bg-gray-100 ${
							!canGoPreviousPage && '!cursor-not-allowed opacity-50'
						}`}
						onClick={() => handlePageChange(currentPage - 1)}
					>
						<IcChevron className='size-3.5 -rotate-90 fill-black' />
					</li>
					{renderPaginationItems()}
					<li
						className={`hover:bg-gray-100 ${
							!canGoNextPage && '!cursor-not-allowed opacity-50'
						}`}
						onClick={() => handlePageChange(currentPage + 1)}
					>
						<IcChevron className='size-3.5 rotate-90 fill-black' />
					</li>
				</ul>
			)}
		</section>
	)
}
