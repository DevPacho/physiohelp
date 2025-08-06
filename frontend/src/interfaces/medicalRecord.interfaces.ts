import { IEvolution } from './evolution.interfaces'

interface IMedicalRecord {
	id: number
	user_id: number
	date?: string
	user_age?: number
	diagnosis?: string
	sessions?: number
	consultation_reason?: string
	report?: string
	evolutions: IEvolution[]
}

export type { IMedicalRecord }
