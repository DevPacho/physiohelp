import { IEvolution } from '@interfaces'

import { apiPublic } from '../config'

interface IUpdateEvolutionParams {
	evolutionId: number
	evolutionData: Partial<IEvolution>
}

export const updateEvolution = async ({
	evolutionId,
	evolutionData,
}: IUpdateEvolutionParams): Promise<IEvolution> => {
	const { data } = await apiPublic.put(
		`/evolutions/${evolutionId}`,
		evolutionData
	)

	return data
}
