import { usePagination, usePatients } from '@hooks'

import { IPatient } from '@interfaces'

import {
	Button,
	IcChevron,
	IcPencil,
	IcSpinner,
	IcTrash,
	Input,
} from '@components/atoms'
import { Modal } from '@components/molecules'
import { DeletePatientModal, PatientModal } from '@components/organisms'
import { useNavigate } from 'react-router'

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
		isPatientModalOpen,
		setIsPatientModalOpen,
		patientModalType,
		setPatientModalType,
		selectedPatient,
		setSelectedPatient,
		handlePatientSubmit,
		isPatientModalLoading,
		isDeletePatientModalOpen,
		setIsDeletePatientModalOpen,
		selectedPatientToDelete,
		setSelectedPatientToDelete,
		handleDeletePatient,
		isDeletingPatient,
	} = usePatients()

	const navigate = useNavigate()

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

	const handleCreatePatient = () => {
		setSelectedPatient(null)
		setPatientModalType('create')
		setIsPatientModalOpen(true)
	}

	const handleSelectPatientToUpdate = (patient: IPatient) => {
		setSelectedPatient(patient)
		setPatientModalType('edit')
		setIsPatientModalOpen(true)
	}

	const handleSelectPatientToDelete = (patient: IPatient) => {
		setSelectedPatientToDelete(patient)
		setIsDeletePatientModalOpen(true)
	}

	return (
		<section className='flex size-full flex-col items-center gap-5'>
			<header className='flex w-full flex-col justify-between gap-3 md:flex-row md:items-center'>
				<h1 className='min-w-fit text-xl font-semibold text-black'>
					Gestión de Pacientes
				</h1>
				<div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:justify-end'>
					<Input
						type='text'
						placeholder='Buscar pacientes'
						value={patientToSearch}
						onChange={setPatientToSearch}
					/>
					<Button text='Nuevo Paciente' onClick={handleCreatePatient} />
				</div>
				<Modal
					title={
						patientModalType === 'create'
							? 'Nuevo Paciente'
							: 'Actualizar Paciente'
					}
					subtitle={
						patientModalType === 'create'
							? 'Diligencia todos los campos para crear un nuevo paciente.'
							: 'Modifica los campos necesarios para actualizar la información del paciente.'
					}
					isOpen={isPatientModalOpen}
					onClose={() => {
						setIsPatientModalOpen(false)
						setSelectedPatient(null)
					}}
					modalContentClassName='w-full xl:min-w-[700px] xl:min-h-[300px] xl:w-fit'
				>
					<PatientModal
						type={patientModalType}
						patient={selectedPatient || undefined}
						isLoading={isPatientModalLoading}
						onSubmit={handlePatientSubmit}
					/>
				</Modal>
				{selectedPatientToDelete && (
					<Modal
						title='Eliminar Paciente'
						subtitle='Confirma la eliminación del paciente seleccionado.'
						isOpen={isDeletePatientModalOpen}
						onClose={() => {
							setIsDeletePatientModalOpen(false)
							setSelectedPatientToDelete(null)
						}}
						modalContentClassName='w-full xl:min-w-[700px] xl:w-fit'
					>
						<DeletePatientModal
							patient={selectedPatientToDelete}
							isDeletingPatient={isDeletingPatient}
							deletePatient={handleDeletePatient}
						/>
					</Modal>
				)}
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
							<th>Tipo de Convenio</th>
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
									className='capitalize *:max-w-xs *:truncate *:p-4 hover:bg-gray-100'
								>
									<td>
										<button
											type='button'
											title='Ver los detalles del paciente'
											className='cursor-pointer hover:underline'
											onClick={() => navigate(`/patients/${patient.id}`)}
										>
											{patient.name || '----'} {patient.last_name || '----'}
										</button>
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
									<td>
										<span
											className={`rounded-full px-3 py-1 text-sm ${
												patient.type === 'Particular'
													? 'text-primary-light bg-blue-100'
													: patient.type === 'SOAT'
														? 'bg-red-100 text-red-600'
														: ''
											}`}
										>
											{patient.type || '----'}
										</span>
									</td>
									<td className='flex items-center gap-3 *:cursor-pointer'>
										<button
											type='button'
											title='Actualizar paciente'
											onClick={() => handleSelectPatientToUpdate(patient)}
										>
											<IcPencil className='hover:fill-primary-light size-5 fill-black' />
										</button>
										<button
											type='button'
											title='Eliminar paciente'
											onClick={() => handleSelectPatientToDelete(patient)}
										>
											<IcTrash className='size-4.5 fill-black hover:fill-red-500' />
										</button>
									</td>
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
