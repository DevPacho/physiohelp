import { apiPublic } from '../config'

interface IGenerateAndDownloadMedicalRecordPdfParams {
	patientId: number
	patientFullName: string
	agreementType: string
	date: string
}

export const generateAndDownloadMedicalRecordPdf = async ({
	patientId,
	patientFullName,
	agreementType,
	date,
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
	link.setAttribute(
		'download',
		`${agreementType} - ${patientFullName} - ${date}.pdf`
	)
	document.body.appendChild(link)
	link.click()
	link.remove()
	window.URL.revokeObjectURL(url)
}
