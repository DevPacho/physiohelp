import { useMedicalRecords } from '@hooks'

import { Button, IcChevron } from '@components/atoms'
import { Modal } from '@components/molecules'
import {
	DeleteMedicalRecordModal,
	MedicalRecordModal,
	PatientEvolutionTab,
	PatientMedicalRecordTab,
} from '@components/organisms'
import { useNavigate, useParams } from 'react-router'

export const PatientDetailsPage = () => {
	const { patientId } = useParams<{ patientId: string }>()
	const navigate = useNavigate()

	const {
		currentPatient,
		currentMedicalRecord,
		isMedicalRecordLoading,
		isEvolutionLoading,
		isDownloadingPdf,
		activeTab,
		setActiveTab,
		showMedicalRecordModal,
		setShowMedicalRecordModal,
		showDeleteMedicalRecordModal,
		setShowDeleteMedicalRecordModal,
		handleMedicalRecordSubmit,
		isDeletingMedicalRecord,
		handleDeleteMedicalRecord,
		handleEvolutionSubmit,
		handleDeleteEvolution,
		handleGenerateAndDownloadPdf,
		showCreateEvolutionModal,
		setShowCreateEvolutionModal,
		selectedEvolution,
		setSelectedEvolution,
		selectedEvolutionToDelete,
		setSelectedEvolutionToDelete,
	} = useMedicalRecords(patientId)

	if (!currentPatient) return null

	return (
		<main className='flex size-full flex-col gap-5 overflow-auto p-10'>
			<header className='flex w-full flex-col justify-between gap-3 md:flex-row md:items-center'>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						title='Volver a la gestión de pacientes'
						onClick={() => navigate('/patients')}
						className='flex cursor-pointer items-center justify-center rounded-full bg-white p-2'
					>
						<IcChevron className='size-4 -rotate-90 fill-black' />
					</button>
					<h1 className='min-w-fit text-xl font-semibold text-black'>
						Paciente: {currentPatient.name} {currentPatient.last_name}
					</h1>
				</div>
				<Button
					text={
						isDownloadingPdf
							? `Descargando ${currentPatient.type === 'SOAT' ? 'Historia Clínica' : 'Informe Final'}...`
							: `Descargar ${currentPatient.type === 'SOAT' ? 'Historia Clínica' : 'Informe Final'}`
					}
					title={
						!currentMedicalRecord
							? `No se encontró ${currentPatient.type === 'SOAT' ? 'ninguna historia clínica' : 'ningún informe'}.`
							: undefined
					}
					onClick={handleGenerateAndDownloadPdf}
					disabled={isDownloadingPdf || !currentMedicalRecord}
				/>
			</header>
			<article className='h-[90%] min-h-[300px] w-full overflow-auto rounded-md bg-white shadow-lg'>
				<nav className='-mb-px flex gap-8 overflow-x-auto rounded-t-md border-b border-gray-200 bg-white p-4 *:cursor-pointer *:border-b-2 *:px-1 *:py-2'>
					<button
						type='button'
						onClick={() => setActiveTab('medical-record')}
						className={`${
							activeTab === 'medical-record'
								? 'border-primary-light text-primary-light font-semibold'
								: 'border-transparent hover:border-black'
						}`}
					>
						{currentPatient.type === 'SOAT'
							? 'Historia Clínica'
							: 'Informe Final'}
					</button>
					{currentPatient.type === 'SOAT' && (
						<button
							type='button'
							title={
								!currentMedicalRecord
									? 'Las evoluciones solo están disponibles luego de crear la historia clínica.'
									: undefined
							}
							onClick={() => setActiveTab('evolutions')}
							className={`disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent ${
								activeTab === 'evolutions'
									? 'border-primary-light text-primary-light font-semibold'
									: 'border-transparent hover:border-black'
							}`}
							disabled={!currentMedicalRecord}
						>
							Evoluciones
						</button>
					)}
				</nav>
				<section className='p-4'>
					{activeTab === 'medical-record' && (
						<PatientMedicalRecordTab
							{...{
								isMedicalRecordLoading,
								currentPatient,
								currentMedicalRecord,
								setShowMedicalRecordModal,
								setShowDeleteMedicalRecordModal,
							}}
						/>
					)}
					{activeTab === 'evolutions' &&
						currentPatient.type === 'SOAT' &&
						currentMedicalRecord && (
							<PatientEvolutionTab
								isLoading={isEvolutionLoading}
								evolutions={currentMedicalRecord.evolutions}
								handleEvolutionSubmit={handleEvolutionSubmit}
								handleDeleteEvolution={handleDeleteEvolution}
								showCreateEvolutionModal={showCreateEvolutionModal}
								setShowCreateEvolutionModal={setShowCreateEvolutionModal}
								selectedEvolution={selectedEvolution}
								setSelectedEvolution={setSelectedEvolution}
								selectedEvolutionToDelete={selectedEvolutionToDelete}
								setSelectedEvolutionToDelete={setSelectedEvolutionToDelete}
							/>
						)}
					{showMedicalRecordModal && currentPatient && (
						<Modal
							title={
								currentMedicalRecord
									? `Actualizar ${currentPatient.type === 'SOAT' ? 'Historia Clínica' : 'Informe Final'}`
									: `Crear ${currentPatient.type === 'SOAT' ? 'Historia Clínica' : 'Informe Final'}`
							}
							subtitle={
								currentMedicalRecord
									? `Modifica los campos necesarios para actualizar ${currentPatient.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}.`
									: `Diligencia todos los campos para crear ${currentPatient.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}.`
							}
							isOpen={showMedicalRecordModal}
							onClose={() => setShowMedicalRecordModal(false)}
							modalContentClassName='w-full xl:min-w-[800px] xl:w-fit'
						>
							<MedicalRecordModal
								patient={currentPatient}
								medicalRecord={currentMedicalRecord}
								onSubmit={handleMedicalRecordSubmit}
								isLoading={isMedicalRecordLoading}
								isEdit={!!currentMedicalRecord}
							/>
						</Modal>
					)}
					{showDeleteMedicalRecordModal && (
						<Modal
							title={`Eliminar ${currentPatient.type === 'SOAT' ? 'Historia Clínica' : 'Informe Final'}`}
							subtitle={`Confirma la eliminación de ${currentPatient.type === 'SOAT' ? 'la historia clínica' : 'el informe final'}.`}
							isOpen={showDeleteMedicalRecordModal}
							onClose={() => setShowDeleteMedicalRecordModal(false)}
							modalContentClassName='w-full xl:min-w-[400px] xl:w-fit'
						>
							<DeleteMedicalRecordModal
								patient={currentPatient}
								medicalRecord={currentMedicalRecord}
								isDeletingMedicalRecord={isDeletingMedicalRecord}
								deleteMedicalRecord={handleDeleteMedicalRecord}
							/>
						</Modal>
					)}
				</section>
			</article>
		</main>
	)
}
