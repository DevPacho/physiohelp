import { IPatient } from '@interfaces'

import { apiPublic } from '../config'

interface IGetPatientsParams {
	skip: number
	limit: number
}

export const getPatients = async ({ skip, limit }: IGetPatientsParams) => {
	const { data } = await apiPublic.get<IPatient[]>('/users/', {
		params: {
			skip,
			limit,
		},
	})

	return data
}
