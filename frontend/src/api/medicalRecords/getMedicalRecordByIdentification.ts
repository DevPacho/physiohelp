import { IMedicalRecord } from '@interfaces'

import { apiPublic } from '../config'

interface IGetMedicalRecordByIdentificationParams {
	patientIdentification: string
}

export const getMedicalRecordByIdentification = async ({
	patientIdentification,
}: IGetMedicalRecordByIdentificationParams): Promise<IMedicalRecord> => {
	const { data } = await apiPublic.get(
		`/users/${patientIdentification}/medical-records/`
	)

	return data
}
