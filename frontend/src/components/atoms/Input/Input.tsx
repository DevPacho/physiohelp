interface IInputProps {
	type: 'text' | 'tel'
	label?: string
	placeholder: string
	value: string
	onChange: (value: string) => void
	disabled?: boolean
	required?: boolean
}

export const Input = ({
	type,
	label,
	placeholder,
	value,
	onChange,
	disabled,
	required,
}: IInputProps) => (
	<div className='flex flex-col gap-1'>
		{label && (
			<label className='text-sm font-medium text-black'>
				{label}
				{required && <span className='ml-1 text-red-500'>*</span>}
			</label>
		)}
		<input
			className='focus:border-primary-light focus:ring-primary-light h-10 min-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
			type={type}
			placeholder={placeholder}
			value={value}
			onChange={event => onChange(event.target.value)}
			disabled={disabled}
			required={required}
		/>
	</div>
)
