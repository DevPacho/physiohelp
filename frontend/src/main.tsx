import { StrictMode } from 'react'

import '@styles/globals.css'

import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Toaster
			position='top-right'
			reverseOrder={false}
			toastOptions={{
				success: { duration: 5000 },
			}}
		/>
	</StrictMode>
)
