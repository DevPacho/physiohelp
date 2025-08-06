import { IPatient } from '@interfaces'

import { apiPublic } from '../config'

interface IGetPatientByIdParams {
	patientId: number
}

export const getPatientById = async ({
	patientId,
}: IGetPatientByIdParams): Promise<IPatient> => {
	const { data } = await apiPublic.get(`/users/${patientId}`)

	return data
}
