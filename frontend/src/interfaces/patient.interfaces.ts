interface IPatient {
	id: number
	name: string
	last_name: string
	identification: string
	gender: string
	address: string
	phone: string
	type: 'Particular' | 'SOAT'
}

export type { IPatient }
