import { Link } from 'react-router-dom';
import { Delete, Edit } from '@mui/icons-material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TerrainIcon from '@mui/icons-material/Terrain';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORY_LABELS } from '../../constants/categories';
import { describeWorkout } from '../../utils/workout';
import {
	formatCalories,
	formatDistanceNumber,
	formatDuration,
	formatElevation,
	formatHeartRate,
	formatPace,
	formatRelativeTime,
} from '../../utils/format';

/**
 * Acima deste tamanho a descrição certamente não cabe em três linhas no card mais
 * estreito do grid. É heurística, não medição do clamp — mas evita prometer um
 * "Ver mais" que não revelaria nada.
 */
const DESCRIPTION_CLAMP_THRESHOLD = 120;

const secondaryIconProps = { className: 'w-3.5 h-3.5 shrink-0', 'aria-hidden': 'true' };

/** Métrica secundária: ícone + valor, em cinza. O `dt` existe só para leitores de tela. */
function SecondaryMetric({ icon, label, value }) {
	return (
		<div className='flex items-center gap-1'>
			{icon}
			<dt className='sr-only'>{label}</dt>
			<dd>{value}</dd>
		</div>
	);
}

function WorkoutCard({ workout, onDelete, onEdit }) {
	const { userId } = useAuth();
	// `User` (maiúsculo) é o campo de relação gerado a partir de `user_id`.
	// É nulo se o autor tiver sido removido.
	const { User: author, user_id: authorId, time, stats, category, description, timestamp } = workout;

	const authorName = author?.name ?? 'Usuário removido';
	const canModify = userId != null && String(authorId) === userId;
	// Cada botão precisa de um rótulo próprio: repetido em dezenas de cards,
	// "Editar treino" não diz a um leitor de tela qual treino ele vai editar.
	const workoutLabel = describeWorkout(workout);
	const isDescriptionLong = description.length > DESCRIPTION_CLAMP_THRESHOLD;

	return (
		<article className='h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-300'>
			<div className='p-5 flex flex-col flex-1'>
				{/* Autor primeiro: num feed social, quem postou vem antes do que foi postado. */}
				<div className='flex items-start gap-3'>
					<div className='w-9 h-9 shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold'>
						{authorName.charAt(0)}
					</div>

					<div className='min-w-0 flex-1'>
						{author ? (
							<Link
								to={`/users/${authorId}`}
								className='block text-sm font-semibold text-brand-graphite truncate hover:underline'
							>
								{authorName}
							</Link>
						) : (
							<span className='block text-sm font-semibold text-gray-500 truncate'>{authorName}</span>
						)}

						<div className='mt-0.5 flex items-center gap-1.5 text-xs text-gray-500'>
							{/* Permalink do treino. O "Ver mais" abaixo só existe quando há texto
							    cortado, então é aqui que mora o caminho garantido até o detalhe. */}
							<Link
								to={`/posts/${workout.id}`}
								className='hover:underline'
								aria-label={`Ver ${workoutLabel}`}
							>
								<time dateTime={timestamp}>{formatRelativeTime(timestamp)}</time>
							</Link>
							<span aria-hidden='true'>·</span>
							{/* O lime aparece como acento, em marca pequena com texto preto
							    (13.88:1) — nunca como bloco grande. */}
							<span className='rounded-full bg-brand-green-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-graphite'>
								{CATEGORY_LABELS[category] ?? category}
							</span>
						</div>
					</div>

					{canModify && (
						<div className='flex gap-1 shrink-0 -mr-1 -mt-1'>
							{onEdit && (
								<button
									type='button'
									onClick={() => onEdit(workout)}
									className='p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors'
									aria-label={`Editar ${workoutLabel}`}
								>
									<Edit className='w-4 h-4' />
								</button>
							)}
							{onDelete && (
								<button
									type='button'
									onClick={() => onDelete(workout)}
									className='p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors'
									aria-label={`Excluir ${workoutLabel}`}
								>
									<Delete className='w-4 h-4' />
								</button>
							)}
						</div>
					)}
				</div>

				{/* A manchete do treino é a distância. O tamanho carrega a hierarquia,
				    não a cor — por isso o número é grafite, e não verde. */}
				<p className='mt-5 text-3xl font-semibold leading-none text-brand-graphite'>
					{formatDistanceNumber(stats.distance)}
					<span className='ml-1 text-base font-medium text-gray-500'>km</span>
				</p>
				<div className='mt-2 h-[3px] w-10 rounded-full bg-brand-green-lime' aria-hidden='true' />

				{/* Métricas primárias: as que descrevem o esforço em si. */}
				<dl className='mt-4 flex gap-6'>
					<div>
						<dt className='text-[11px] uppercase tracking-wide text-gray-400'>Tempo</dt>
						<dd className='text-[15px] font-semibold text-brand-graphite'>{formatDuration(time)}</dd>
					</div>
					{stats.pace != null && (
						<div>
							<dt className='text-[11px] uppercase tracking-wide text-gray-400'>Ritmo</dt>
							<dd className='text-[15px] font-semibold text-brand-graphite'>
								{formatPace(stats.pace)}
							</dd>
						</div>
					)}
				</dl>

				{/* Métricas secundárias: mesmo tratamento para obrigatórias e opcionais,
				    porque a diferença entre elas nunca foi semântica. */}
				<dl className='mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500'>
					<SecondaryMetric
						icon={<LocalFireDepartmentIcon {...secondaryIconProps} />}
						label='Calorias'
						value={formatCalories(stats.calories)}
					/>
					<SecondaryMetric
						icon={<MonitorHeartIcon {...secondaryIconProps} />}
						label='Batimentos'
						value={formatHeartRate(stats.heartRate)}
					/>
					{stats.elevation != null && (
						<SecondaryMetric
							icon={<TerrainIcon {...secondaryIconProps} />}
							label='Elevação'
							value={formatElevation(stats.elevation)}
						/>
					)}
				</dl>

				<div className='mt-4 flex flex-col flex-1'>
					<p className='text-sm text-gray-600 leading-relaxed line-clamp-3'>{description}</p>

					{isDescriptionLong && (
						// `mt-auto` alinha os links na base, mesmo com cards de alturas diferentes.
						<Link
							to={`/posts/${workout.id}`}
							className='mt-auto pt-3 self-start text-sm font-medium text-brand-green-deep hover:underline'
							aria-label={`Ver ${workoutLabel}`}
						>
							Ver mais
						</Link>
					)}
				</div>
			</div>
		</article>
	);
}

export default WorkoutCard;
