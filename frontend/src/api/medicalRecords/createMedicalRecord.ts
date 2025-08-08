import { IMedicalRecord } from '@interfaces'

import { apiPublic } from '../config'

interface ICreateMedicalRecordParams {
	patientId: number
	medicalRecordData: Partial<IMedicalRecord>
}

export const createMedicalRecord = async ({
	patientId,
	medicalRecordData,
}: ICreateMedicalRecordParams): Promise<IMedicalRecord> => {
	const { data } = await apiPublic.post(`/medical-records/`, {
		user_id: patientId,
		...medicalRecordData,
	})

	return data
}
