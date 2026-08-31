import { PatientDetailsPage, PatientsPage } from '@pages'

import { MainLayout } from '@components/layouts'
import { Navigate, createBrowserRouter } from 'react-router'

export const Router = createBrowserRouter([
	{
		path: '/',
		element: <MainLayout />,
		errorElement: <h1>Error page - PhysioHelp</h1>,
		children: [
			{
				index: true,
				path: 'patients',
				element: <PatientsPage />,
			},
			{
				path: 'patients/:patientId',
				element: <PatientDetailsPage />,
			},
			{
				path: '/',
				element: <Navigate to='/patients' replace />,
			},
		],
	},
	{
		path: '*',
		element: <Navigate to='/patients' replace />,
	},
])
