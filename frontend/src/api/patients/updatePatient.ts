import { IPatient } from '@interfaces'

import { apiPublic } from '../config'

interface IUpdatePatientParams {
	patientId: number
	patientData: Partial<IPatient>
}

export const updatePatient = async ({
	patientId,
	patientData,
}: IUpdatePatientParams): Promise<IPatient> => {
	const { data } = await apiPublic.patch(`/users/${patientId}/`, patientData)

	return data
}
