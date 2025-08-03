import { apiPublic } from '../config'

export const getPatientsCount = async () => {
	const { data } = await apiPublic.get<{ count: number }>('/users/count/')

	return data
}
