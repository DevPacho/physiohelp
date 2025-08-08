import { IEvolution } from '@interfaces'

import { Button } from '@components/atoms'

interface IDeleteEvolutionModalProps {
	evolution: IEvolution
	isDeletingEvolution: boolean
	deleteEvolution: (evolutionId: number) => Promise<void>
}

export const DeleteEvolutionModal = ({
	evolution,
	isDeletingEvolution,
	deleteEvolution,
}: IDeleteEvolutionModalProps) => {
	const handleDelete = () => deleteEvolution(evolution.id)

	return (
		<div className='mt-5'>
			<p className='text-sm'>
				¿Está segura de que desea eliminar la evolución del{' '}
				<span className='font-semibold text-black'>
					{new Date(evolution.date).toLocaleDateString('es-ES')}
				</span>
				?
			</p>
			<p className='mt-2 text-sm'>
				Esta acción no se puede deshacer. Se eliminarán todas las observaciones
				asociadas a esta evolución.
			</p>
			<footer className='flex justify-end gap-3 pt-4'>
				<Button
					text={
						isDeletingEvolution
							? 'Eliminando Evolución...'
							: 'Eliminar Evolución'
					}
					onClick={handleDelete}
					disabled={isDeletingEvolution}
				/>
			</footer>
		</div>
	)
}
