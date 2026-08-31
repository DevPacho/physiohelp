import { apiPublic } from '../config'

interface IDeleteMedicalRecordParams {
	medicalRecordId: number
}

export const deleteMedicalRecord = async ({
	medicalRecordId,
}: IDeleteMedicalRecordParams): Promise<void> => {
	await apiPublic.delete(`/medical-records/${medicalRecordId}`)
}
