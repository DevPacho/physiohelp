import { apiPublic } from '../config'

interface IDeleteEvolutionParams {
	evolutionId: number
}

export const deleteEvolution = async ({
	evolutionId,
}: IDeleteEvolutionParams): Promise<void> => {
	await apiPublic.delete(`/evolutions/${evolutionId}`)
}
