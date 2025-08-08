import { Dispatch, SetStateAction } from 'react'

import { IMedicalRecord, IPatient } from '@interfaces'

import { Button, IcPencil, IcSpinner, IcTrash } from '@components/atoms'
import { Modal } from '@components/molecules'

import { MedicalRecordModal } from '../MedicalRecordModal'

interface IPatientMedicalRecordTabProps {
	isMedicalRecordLoading: boolean
	currentPatient: IPatient
	currentMedicalRecord: IMedicalRecord | null
	showMedicalRecordModal: boolean
	setShowMedicalRecordModal: Dispatch<SetStateAction<boolean>>
	handleCreateOrUpdateMedicalRecord: (
		medicalRecordData: Partial<IMedicalRecord>
	) => Promise<void>
}

export const PatientMedicalRecordTab = ({
	isMedicalRecordLoading,
	currentPatient,
	currentMedicalRecord,
	showMedicalRecordModal,
	setShowMedicalRecordModal,
	handleCreateOrUpdateMedicalRecord,
}: IPatientMedicalRecordTabProps) => (
	<>
		{isMedicalRecordLoading ? (
			<div className='flex h-full justify-center'>
				<IcSpinner className='size-5 animate-spin fill-black' />
			</div>
		) : currentMedicalRecord ? (
			<div className='flex flex-col gap-4'>
				<div className='flex flex-col gap-2 sm:gap-0'>
					<div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
						<h2 className='min-w-fit text-xl font-semibold text-black'>
							{currentPatient.type === 'SOAT'
								? 'Historia Clínica'
								: 'Informe Final'}
						</h2>
						<div className='flex items-center gap-3 *:cursor-pointer'>
							<button
								type='button'
								title={`Actualizar ${currentPatient.type === 'SOAT' ? 'historia clínica' : 'informe final'}`}
								onClick={() => setShowMedicalRecordModal(true)}
							>
								<IcPencil className='hover:fill-primary-light size-5 fill-black' />
							</button>
							<button
								type='button'
								title={`Eliminar ${currentPatient.type === 'SOAT' ? 'historia clínica' : 'informe final'}`}
								// onClick={() => setDeletingEvolution(evolution)}
							>
								<IcTrash className='size-4.5 fill-black hover:fill-red-500' />
							</button>
						</div>
					</div>
					<h3 className='text-sm text-black'>
						En base a esta información se generará el documento PDF{' '}
						{currentPatient.type === 'SOAT'
							? 'de la historia clínica'
							: 'del informe final'}
						.
					</h3>
				</div>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>Fecha</label>
						<p className='text-sm text-black'>
							{currentMedicalRecord.date
								? currentMedicalRecord.date.split('-').reverse().join('/')
								: '----'}
						</p>
					</fieldset>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>Edad</label>
						<p className='text-sm text-black'>
							{currentMedicalRecord.user_age
								? `${currentMedicalRecord.user_age} años`
								: '----'}
						</p>
					</fieldset>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>
							Número de Sesiones
						</label>
						<p className='text-sm text-black'>
							{currentMedicalRecord.sessions || '----'}
						</p>
					</fieldset>
				</div>
				<div className='grid grid-cols-1 gap-4'>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>
							Diagnóstico
						</label>
						<span className='rounded-md bg-gray-50 p-4'>
							<p className='text-sm whitespace-pre-wrap text-black'>
								{currentMedicalRecord.diagnosis || '----'}
							</p>
						</span>
					</fieldset>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>
							Motivo de Consulta
						</label>
						<span className='rounded-md bg-gray-50 p-4'>
							<p className='text-sm whitespace-pre-wrap text-black'>
								{currentMedicalRecord.consultation_reason || '----'}
							</p>
						</span>
					</fieldset>
					{currentPatient.type === 'Particular' && (
						<fieldset className='flex flex-col gap-1'>
							<label className='text-sm font-medium text-black'>
								Informe Final
							</label>
							<span className='rounded-md bg-gray-50 p-4'>
								<p className='text-sm whitespace-pre-wrap text-black'>
									{currentMedicalRecord.report}
								</p>
							</span>
						</fieldset>
					)}
				</div>
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
							onSubmit={handleCreateOrUpdateMedicalRecord}	
							isLoading={isMedicalRecordLoading}
							isEdit={!!currentMedicalRecord}
						/>
					</Modal>
				)}
			</div>
		) : (
			<div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<p className='text-[15px]'>
					No se ha encontrado{' '}
					{currentPatient.type === 'SOAT'
						? 'ninguna historia clínica asociada'
						: 'ningún informe final asociado'}{' '}
					a este paciente.
				</p>
				<Button
					text={`Crear ${currentPatient.type === 'SOAT' ? 'Historia Clínica' : 'Informe Final'}`}
					onClick={() => setShowMedicalRecordModal(true)}
				/>
			</div>
		)}
	</>
)
