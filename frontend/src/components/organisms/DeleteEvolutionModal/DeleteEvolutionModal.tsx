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
		<div className='mt-5 text-sm text-black'>
			<p>
				¿Está segura de que desea eliminar la evolución del{' '}
				<span className='font-semibold text-black'>
					{evolution.date.split('-').reverse().join('/')}
				</span>
				? <br />
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
