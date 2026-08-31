import { Router } from '@router'

import '@styles/globals.css'

import 'react-datepicker/dist/react-datepicker.css'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'

createRoot(document.getElementById('root')!).render(
	<>
		<RouterProvider router={Router} />
		<Toaster
			position='top-center'
			reverseOrder={false}
			toastOptions={{
				success: { duration: 5000 },
			}}
		/>
	</>
)
