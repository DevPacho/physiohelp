import { IPatient } from '@interfaces'

import { apiPublic } from '../config'

interface IGetPatientsParams {
	skip: number
	limit: number
	search?: string
}

export const getPatients = async ({
	skip,
	limit,
	search,
}: IGetPatientsParams) => {
	const { data } = await apiPublic.get<IPatient[]>('/users/', {
		params: {
			skip,
			limit,
			search,
		},
	})

	return data
}
