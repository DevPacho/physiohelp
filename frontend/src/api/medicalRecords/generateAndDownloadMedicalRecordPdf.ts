import { apiPublic } from '../config'

interface IGenerateAndDownloadMedicalRecordPdfParams {
	patientId: number
}

export const generateAndDownloadMedicalRecordPdf = async ({
	patientId,
}: IGenerateAndDownloadMedicalRecordPdfParams): Promise<void> => {
	const response = await apiPublic.post(
		`/users/${patientId}/generate-pdf`,
		{},
		{
			responseType: 'blob',
		}
	)

	const url = window.URL.createObjectURL(new Blob([response.data]))
	const link = document.createElement('a')

	link.href = url
	link.setAttribute('download', '')
	document.body.appendChild(link)
	link.click()
	link.remove()
	window.URL.revokeObjectURL(url)
}
