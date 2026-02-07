import Image from 'next/image'

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

export type RegisterStep = {
	id: number // chainId (o cualquier id)
	label: string
	logoSrc: string
	status: StepStatus
}

type Props = {
	steps: RegisterStep[]
}

export function RegisterStepper({ steps }: Props) {
	return (
		<div className='flex flex-col gap-3'>
			{steps.map((step, idx) => {
				const isLast = idx === steps.length - 1

				return (
					<div key={step.id} className='relative flex items-center gap-3'>
						{/* connector line */}
						{!isLast && (
							<div className='absolute left-[11px] top-[26px] h-[calc(100%-14px)] w-px bg-zinc-700' />
						)}

						{/* circle */}
						<div
							className={[
								'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border',
								step.status === 'done'
									? 'border-blue-500 bg-blue-500'
									: step.status === 'loading'
										? 'border-blue-500 bg-zinc-900'
										: step.status === 'error'
											? 'border-red-500 bg-zinc-900'
											: 'border-zinc-600 bg-zinc-900'
							].join(' ')}
						>
							{step.status === 'done' ? (
								<svg
									className='h-4 w-4 text-white'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={3}
										d='M5 13l4 4L19 7'
									/>
								</svg>
							) : step.status === 'loading' ? (
								<div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
							) : (
								<span className='text-xs text-zinc-200'>{idx + 1}</span>
							)}
						</div>

						{/* chain logo + label */}
						<div className='flex items-center gap-2'>
							<div className='h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden'>
								<Image
									src={step.logoSrc}
									alt={step.label}
									width={20}
									height={20}
									className='h-5 w-5'
								/>
							</div>

							<div className='flex flex-col'>
								<span className='text-sm text-white'>{step.label}</span>
								<span className='text-xs text-zinc-400'>
									{step.status === 'done'
										? 'Done'
										: step.status === 'loading'
											? 'Processing...'
											: step.status === 'error'
												? 'Error'
												: 'Pending'}
								</span>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
