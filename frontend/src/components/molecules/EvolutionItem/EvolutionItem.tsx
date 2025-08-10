import { IEvolution } from '@interfaces'

import { IcPencil, IcTrash } from '@components/atoms'

interface IEvolutionItemProps {
	evolution: IEvolution
	setSelectedEvolution: (evolution: IEvolution) => void
	setSelectedEvolutionToDelete: (evolution: IEvolution) => void
}

export const EvolutionItem = ({
	evolution,
	setSelectedEvolution,
	setSelectedEvolutionToDelete,
}: IEvolutionItemProps) => (
	<article className='flex flex-col gap-3 rounded-lg border border-gray-200 p-4'>
		<header className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
			<h3 className='text-lg font-semibold text-black'>
				Evolución #{evolution.evolution_number ?? ''} -{' '}
				<span className='text-sm font-normal'>
					{evolution.date.split('-').reverse().join('/')}
				</span>
			</h3>
			<div className='flex items-center gap-3 *:cursor-pointer'>
				<button
					type='button'
					title='Actualizar evolución'
					onClick={() => setSelectedEvolution(evolution)}
				>
					<IcPencil className='hover:fill-primary-light size-5 fill-black' />
				</button>
				<button
					type='button'
					title='Eliminar evolución'
					onClick={() => setSelectedEvolutionToDelete(evolution)}
				>
					<IcTrash className='size-4.5 fill-black hover:fill-red-500' />
				</button>
			</div>
		</header>
		<div className='flex flex-col gap-2 text-black'>
			<h4 className='text-sm font-semibold'>Observaciones:</h4>
			<span className='max-h-[200px] overflow-y-auto rounded-md bg-gray-50 p-4'>
				<p className='text-sm whitespace-pre-wrap'>{evolution.observations}</p>
			</span>
		</div>
	</article>
)
