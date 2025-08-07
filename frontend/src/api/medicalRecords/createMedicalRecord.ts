import { IMedicalRecord } from '@interfaces'

import { apiPublic } from '../config'

interface ICreateMedicalRecordParams {
	patientIdentification: string
	medicalRecordData: Partial<IMedicalRecord>
}

export const createMedicalRecord = async ({
	patientIdentification,
	medicalRecordData,
}: ICreateMedicalRecordParams): Promise<IMedicalRecord> => {
	const { data } = await apiPublic.post(
		`/users/${patientIdentification}/medical-records/`,
		medicalRecordData
	)

	return data
}
