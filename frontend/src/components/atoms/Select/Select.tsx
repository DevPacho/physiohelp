interface ISelectOption {
	value: string
	label: string
}

interface ISelectProps {
	label: string
	placeholder: string
	options: ISelectOption[]
	value: string
	onChange: (value: string) => void
	disabled: boolean
	required: boolean
}

export const Select = ({
	label,
	placeholder,
	options,
	value,
	onChange,
	disabled,
	required,
}: ISelectProps) => (
	<div className='flex flex-col gap-1'>
		<label className='text-sm font-medium text-black'>
			{label}
			{required && <span className='ml-1 text-red-500'>*</span>}
		</label>
		<select
			className='focus:border-primary-light focus:primary-light min-w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
			value={value}
			onChange={event => onChange(event.target.value)}
			disabled={disabled}
			required={required}
		>
			<option value=''>{placeholder}</option>
			{options.map(option => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</div>
)
