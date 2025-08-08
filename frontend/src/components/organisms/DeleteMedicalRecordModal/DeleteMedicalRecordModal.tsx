import { IMedicalRecord, IPatient } from '@interfaces'

import { Button } from '@components/atoms'

interface IDeleteMedicalRecordModalProps {
	patient: IPatient
	medicalRecord: IMedicalRecord
	isDeletingMedicalRecord: boolean
	deleteMedicalRecord: (medicalRecordId: number) => Promise<void>
}

export const DeleteMedicalRecordModal = ({
	patient,
	medicalRecord,
	isDeletingMedicalRecord,
	deleteMedicalRecord,
}: IDeleteMedicalRecordModalProps) => {
	const handleDelete = () => deleteMedicalRecord(medicalRecord.id)

	return (
		<div className='mt-5 text-sm text-black'>
			<p>
				¿Está segura de que desea eliminar la historia clínica del paciente{' '}
				<span className='font-semibold text-black capitalize'>
					{patient.name} {patient.last_name}
				</span>{' '}
				? <br />
				Esta acción no se puede deshacer. Se eliminarán todos sus datos
				asociados.
			</p>
			<footer className='flex justify-end gap-3 pt-4'>
				<Button
					text={
						isDeletingMedicalRecord
							? 'Eliminando Historia Clínica...'
							: 'Eliminar Historia Clínica'
					}
					onClick={handleDelete}
					disabled={isDeletingMedicalRecord}
				/>
			</footer>
		</div>
	)
}
