import { IPatient } from '@interfaces'

import { Button } from '@components/atoms'

interface IDeletePatientModalProps {
	patient: IPatient
	isDeletingPatient: boolean
	deletePatient: (patientId: number) => Promise<void>
}

export const DeletePatientModal = ({
	patient,
	isDeletingPatient,
	deletePatient,
}: IDeletePatientModalProps) => {
	const handleDelete = () => deletePatient(patient.id)

	return (
		<div className='mt-5 text-sm text-black'>
			<p>
				¿Está segura de que desea eliminar a{' '}
				<span className='font-semibold text-black capitalize'>
					{patient.name} {patient.last_name}
				</span>{' '}
				como paciente? <br />
				Esta acción no se puede deshacer. Se eliminarán todos sus datos
				asociados.
			</p>
			<footer className='flex justify-end gap-3 pt-4'>
				<Button
					text={
						isDeletingPatient ? 'Eliminando Paciente...' : 'Eliminar Paciente'
					}
					onClick={handleDelete}
					disabled={isDeletingPatient}
				/>
			</footer>
		</div>
	)
}
