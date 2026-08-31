import { IEvolution } from '@interfaces'

import { apiPublic } from '../config'

interface ICreateEvolutionParams {
	medicalRecordId: number
	evolutionData: Partial<IEvolution>
}

export const createEvolution = async ({
	medicalRecordId,
	evolutionData,
}: ICreateEvolutionParams): Promise<IEvolution> => {
	const { data } = await apiPublic.post(
		`/medical-records/${medicalRecordId}/evolutions/`,
		evolutionData
	)

	return data
}
