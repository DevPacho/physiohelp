import { IMedicalRecord } from '@interfaces'

import { apiPublic } from '../config'

interface IGetMedicalRecordByPatientIdParams {
	patientId: number
}

export const getMedicalRecordByPatientId = async ({
	patientId,
}: IGetMedicalRecordByPatientIdParams): Promise<IMedicalRecord> => {
	const { data } = await apiPublic.get(`/users/${patientId}/medical-records/`)

	return data
}
