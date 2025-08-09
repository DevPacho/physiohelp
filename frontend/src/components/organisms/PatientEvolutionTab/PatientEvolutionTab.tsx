import { Dispatch, SetStateAction } from 'react'

import { IEvolution } from '@interfaces'

import { Button } from '@components/atoms'
import { EvolutionItem, Modal } from '@components/molecules'

import { DeleteEvolutionModal } from '../DeleteEvolutionModal/DeleteEvolutionModal'
import { EvolutionModal } from '../EvolutionModal/EvolutionModal'

interface IPatientEvolutionTabProps {
  evolutions: IEvolution[]
  handleEvolutionSubmit: (
    evolutionId: number | null,
    evolutionData: Partial<IEvolution>
  ) => Promise<void>
  handleDeleteEvolution: (evolutionId: number) => Promise<void>
  showCreateEvolutionModal: boolean
  setShowCreateEvolutionModal: Dispatch<SetStateAction<boolean>>
  selectedEvolution: IEvolution | null
  setSelectedEvolution: Dispatch<SetStateAction<IEvolution | null>>
  selectedEvolutionToDelete: IEvolution | null
  setSelectedEvolutionToDelete: Dispatch<SetStateAction<IEvolution | null>>
  evolutionsCount: number | null
  evolutionsPerPage: number
  currentPage: number
  isEvolutionModalLoading: boolean
  isDeletingEvolution: boolean
}

export const PatientEvolutionTab = ({
  evolutions,
  handleEvolutionSubmit,
  handleDeleteEvolution,
  showCreateEvolutionModal,
  setShowCreateEvolutionModal,
  selectedEvolution,
  setSelectedEvolution,
  selectedEvolutionToDelete,
  setSelectedEvolutionToDelete,
  evolutionsCount,
  
  isEvolutionModalLoading,
  isDeletingEvolution,
}: IPatientEvolutionTabProps) => (
  <>
    {evolutionsCount === 0 ? (
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <p className='text-[15px]'>
          No se ha encontrado ninguna evolución asociada a este paciente.
        </p>
        <Button
          text='Crear Evolución'
          onClick={() => setShowCreateEvolutionModal(true)}
        />
      </div>
    ) : (
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          <div className='flex flex-col gap-1'>
            <h2 className='min-w-fit text-xl font-semibold text-black'>
              Evoluciones
            </h2>
            <h3 className='text-sm text-black'>
              Registro de evoluciones del paciente.
            </h3>
          </div>
          <Button
            text='Crear Evolución'
            onClick={() => setShowCreateEvolutionModal(true)}
          />
        </div>
        {evolutions.map((evolution) => (
          <EvolutionItem
            key={evolution.id}
            evolution={evolution}
            setSelectedEvolution={setSelectedEvolution}
            setSelectedEvolutionToDelete={setSelectedEvolutionToDelete}
          />
        ))}
      </div>
    )}
    {showCreateEvolutionModal && (
      <Modal
        title='Crear Evolución'
        subtitle='Diligencia todos los campos para crear la evolución.'
        isOpen={showCreateEvolutionModal}
        onClose={() => setShowCreateEvolutionModal(false)}
        modalContentClassName='w-full xl:min-w-[600px] xl:w-fit'
      >
        <EvolutionModal
          isLoading={isEvolutionModalLoading}
          onSubmit={evolutionData => handleEvolutionSubmit(null, evolutionData)}
        />
      </Modal>
    )}
    {selectedEvolution && (
      <Modal
        title='Actualizar Evolución'
        subtitle='Modifica los campos necesarios para actualizar la evolución.'
        isOpen={!!selectedEvolution}
        onClose={() => setSelectedEvolution(null)}
        modalContentClassName='w-full xl:min-w-[600px] xl:w-fit'
      >
        <EvolutionModal
          isLoading={isEvolutionModalLoading}
          isEdit={!!selectedEvolution}
          evolution={selectedEvolution}
          onSubmit={evolutionData =>
            handleEvolutionSubmit(selectedEvolution.id, evolutionData)
          }
        />
      </Modal>
    )}
    {selectedEvolutionToDelete && (
      <Modal
        title='Eliminar Evolución'
        subtitle='Confirma la eliminación de la evolución seleccionada.'
        isOpen={!!selectedEvolutionToDelete}
        onClose={() => setSelectedEvolutionToDelete(null)}
        modalContentClassName='w-full xl:min-w-[700px] xl:w-fit'
      >
        <DeleteEvolutionModal
          evolution={selectedEvolutionToDelete}
          isDeletingEvolution={isDeletingEvolution}
          deleteEvolution={handleDeleteEvolution}
        />
      </Modal>
    )}
  </>
)