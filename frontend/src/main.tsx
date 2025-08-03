import { StrictMode } from 'react'

import { Router } from '@router'

import '@styles/globals.css'

import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={Router} />
		<Toaster
			position='top-right'
			reverseOrder={false}
			toastOptions={{
				success: { duration: 5000 },
			}}
		/>
	</StrictMode>
)
