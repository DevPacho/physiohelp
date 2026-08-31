import { IPatient } from '@interfaces'

import { apiPublic } from '../config'

interface ICreatePatientParams {
	patientData: IPatient
}

export const createPatient = async ({
	patientData,
}: ICreatePatientParams): Promise<IPatient> => {
	const { data } = await apiPublic.post('/users/', patientData)

	return data
}
