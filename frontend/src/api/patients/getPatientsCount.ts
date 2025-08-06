import { apiPublic } from '../config'

interface IGetPatientsCountParams {
	search?: string
}

export const getPatientsCount = async ({ search }: IGetPatientsCountParams) => {
	const { data } = await apiPublic.get<{ count: number }>('/users/count', {
		params: {
			search,
		},
	})

	return data
}
