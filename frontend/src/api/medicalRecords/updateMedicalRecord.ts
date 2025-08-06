import { IMedicalRecord } from '@interfaces'

import { apiPublic } from '../config'

interface IUpdateMedicalRecordParams {
	patientIdentification: string
	medicalRecordData: Partial<IMedicalRecord>
}

export const updateMedicalRecord = async ({
	patientIdentification,
	medicalRecordData,
}: IUpdateMedicalRecordParams): Promise<IMedicalRecord> => {
	const { data } = await apiPublic.put(
		`/users/${patientIdentification}/medical-records/`,
		medicalRecordData
	)

	return data
}
