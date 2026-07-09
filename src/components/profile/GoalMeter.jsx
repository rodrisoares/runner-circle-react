import { Delete } from '@mui/icons-material';
import { goalProgress } from '../../utils/stats';

const dateLabel = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });


function GoalMeter({ goal, workouts, onDelete }) {
	const { achieved, remaining, fillRatio, percent, isComplete, isExpired, daysLeft } = goalProgress(
		goal,
		workouts
	);

	const status = isComplete
		? 'Concluída'
		: isExpired
			? 'Prazo encerrado'
			: `Faltam ${remaining} km · ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`;

	return (
		<div className='bg-white rounded-lg border border-gray-300 shadow-sm p-4'>
			<div className='flex items-start justify-between gap-2'>
				<div className='min-w-0'>
					<h3 className='font-semibold text-brand-graphite truncate'>{goal.title}</h3>
					<p className='text-xs text-gray-500'>
						{dateLabel(goal.startDate)} — {dateLabel(goal.deadline)}
					</p>
				</div>

				{onDelete && (
					<button
						type='button'
						onClick={() => onDelete(goal)}
						className='p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0'
						aria-label={`Excluir a meta ${goal.title}`}
						title='Excluir meta'
					>
						<Delete className='w-4 h-4' />
					</button>
				)}
			</div>

			<div className='mt-3 flex items-baseline gap-1'>
				<span className='text-xl font-semibold text-brand-green-deep'>{achieved}</span>
				<span className='text-sm text-gray-500'>de {goal.targetDistance} km</span>
				<span className='ml-auto text-sm font-medium text-gray-600'>{percent}%</span>
			</div>

			<div
				role='progressbar'
				aria-valuenow={achieved}
				aria-valuemin={0}
				aria-valuemax={goal.targetDistance}
				aria-valuetext={`${achieved} de ${goal.targetDistance} quilômetros, ${percent} por cento`}
				className='mt-2 h-2 w-full rounded-full bg-brand-green-medium overflow-hidden'
			>
				<div
					className='h-full rounded-full bg-brand-green-dark transition-[width] duration-500'
					style={{ width: `${fillRatio * 100}%` }}
				/>
			</div>

			<p className='mt-2 text-xs text-gray-500'>{status}</p>
		</div>
	);
}

export default GoalMeter;
