import { apiPublic } from '../config'

interface IDeletePatientParams {
	patientId: number
}

export const deletePatient = async ({
	patientId,
}: IDeletePatientParams): Promise<void> => {
	await apiPublic.delete(`/users/${patientId}`)
}
