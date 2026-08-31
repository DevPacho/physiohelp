import { IMedicalRecord } from '@interfaces'

import { apiPublic } from '../config'

interface IUpdateMedicalRecordParams {
	medicalRecordId: number
	medicalRecordData: Partial<IMedicalRecord>
}

export const updateMedicalRecord = async ({
	medicalRecordId,
	medicalRecordData,
}: IUpdateMedicalRecordParams): Promise<IMedicalRecord> => {
	const { data } = await apiPublic.put(
		`/medical-records/${medicalRecordId}`,
		medicalRecordData
	)

	return data
}
