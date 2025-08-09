import { IEvolution } from '@interfaces'

import { apiPublic } from '../config'

interface IGetEvolutionsParams {
	medicalRecordId: number
	skip: number
	limit: number
}

export const getEvolutions = async ({
	medicalRecordId,
	skip,
	limit,
}: IGetEvolutionsParams) => {
	const { data } = await apiPublic.get<IEvolution[]>(
		`/medical-records/${medicalRecordId}/evolutions`,
		{
			params: {
				skip,
				limit,
			},
		}
	)

	return data
}
