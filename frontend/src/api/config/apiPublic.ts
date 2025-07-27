import { apiUrl } from '@constants'

import axios from 'axios'
import type { AxiosInstance } from 'axios'

export const apiPublic: AxiosInstance = axios.create({
	baseURL: apiUrl,
	withCredentials: false,
})
