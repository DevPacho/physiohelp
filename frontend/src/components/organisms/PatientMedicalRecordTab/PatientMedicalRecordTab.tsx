import { Dispatch, SetStateAction } from 'react'

import { IMedicalRecord, IPatient } from '@interfaces'

import { Button, IcPencil, IcSpinner, IcTrash } from '@components/atoms'

interface IPatientMedicalRecordTabProps {
	isMedicalRecordLoading: boolean
	currentPatient: IPatient
	currentMedicalRecord: IMedicalRecord | null
	setShowMedicalRecordModal: Dispatch<SetStateAction<boolean>>
	setShowDeleteMedicalRecordModal: Dispatch<SetStateAction<boolean>>
}

export const PatientMedicalRecordTab = ({
	isMedicalRecordLoading,
	currentPatient,
	currentMedicalRecord,
	setShowMedicalRecordModal,
	setShowDeleteMedicalRecordModal,
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
								onClick={() => setShowDeleteMedicalRecordModal(true)}
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
								? `${currentMedicalRecord.user_age} ${Number(currentMedicalRecord.user_age) === 1 ? 'año' : 'años'}`
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
						<span className='max-h-[200px] overflow-y-auto rounded-md bg-gray-50 p-4'>
							<p className='text-sm text-justify whitespace-pre-wrap text-black'>
								{currentMedicalRecord.diagnosis || '----'}
							</p>
						</span>
					</fieldset>
					<fieldset className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-black'>
							Motivo de Consulta
						</label>
						<span className='max-h-[200px] overflow-y-auto rounded-md bg-gray-50 p-4'>
							<p className='text-sm text-justify whitespace-pre-wrap text-black'>
								{currentMedicalRecord.consultation_reason || '----'}
							</p>
						</span>
					</fieldset>
					{currentPatient.type === 'Particular' && (
						<fieldset className='flex flex-col gap-1'>
							<label className='text-sm font-medium text-black'>
								Informe Final
							</label>
							<span className='max-h-[200px] overflow-y-auto rounded-md bg-gray-50 p-4'>
								<p className='text-sm text-justify whitespace-pre-wrap text-black'>
									{currentMedicalRecord.report}
								</p>
							</span>
						</fieldset>
					)}
				</div>
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
