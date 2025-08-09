import { apiPublic } from '../config'

interface IGetEvolutionsCountParams {
	medicalRecordId: number
}

export const getEvolutionsCount = async ({
	medicalRecordId,
}: IGetEvolutionsCountParams) => {
	const { data } = await apiPublic.get<{ count: number }>(
		`/medical-records/${medicalRecordId}/evolutions/count`
	)

	return data
}
