import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import TerrainIcon from '@mui/icons-material/Terrain';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import { GET_FEED_POST } from '../../database/graphql/query/feed';
import { CATEGORY_LABELS } from '../constants/categories';
import { useAuth } from '../hooks/useAuth';
import {
	formatCalories,
	formatDistance,
	formatDuration,
	formatElevation,
	formatHeartRate,
	formatPace,
	formatRelativeTime,
} from '../utils/format';

const metricIconProps = {
	className: 'w-5 h-5 text-brand-green-deep shrink-0',
	'aria-hidden': 'true',
};

function Metric({ icon, label, value }) {
	return (
		<div className='flex items-center gap-3 rounded-lg border border-gray-200 p-3'>
			{icon}
			<div className='min-w-0'>
				<dt className='text-xs text-gray-500'>{label}</dt>
				<dd className='text-sm font-semibold text-brand-graphite'>{value}</dd>
			</div>
		</div>
	);
}

function PostDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { userId } = useAuth();

	const { data, loading, error } = useQuery(GET_FEED_POST, { variables: { id } });
	const workout = data?.Feed;

	const renderContent = () => {
		if (loading) {
			return <p className='text-center text-gray-500 py-12'>Carregando treino...</p>;
		}

		if (error) {
			return <ErrorMessage message='Erro ao carregar o treino' error={error.message} />;
		}

		if (!workout) {
			return <ErrorMessage message='Treino não encontrado' />;
		}

		const { User: author, user_id: authorId, time, stats, category, description, timestamp } = workout;
		const authorName = author?.name ?? 'Usuário removido';
		const isOwner = userId != null && String(authorId) === userId;

		return (
			<article className='bg-white rounded-lg border border-gray-300 shadow-sm p-6'>
				<div className='flex items-start justify-between gap-4'>
					<span className='inline-flex items-center rounded-full bg-brand-green-light px-2.5 py-0.5 text-xs font-semibold text-brand-green-deep'>
						{CATEGORY_LABELS[category] ?? category}
					</span>

					{isOwner && (
						<Link
							to={`/posts/${workout.id}/edit`}
							className='text-sm font-semibold text-brand-graphite border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors'
						>
							Editar
						</Link>
					)}
				</div>

				<div className='mt-4 flex items-center gap-3'>
					<div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0'>
						{authorName.charAt(0)}
					</div>
					<div className='min-w-0'>
						{author ? (
							<Link
								to={`/users/${authorId}`}
								className='block font-medium text-brand-graphite hover:underline truncate'
							>
								{authorName}
							</Link>
						) : (
							<span className='block font-medium text-gray-500 truncate'>{authorName}</span>
						)}
						<time dateTime={timestamp} className='block text-xs text-gray-500'>
							{formatRelativeTime(timestamp)} ·{' '}
							{new Date(timestamp).toLocaleString('pt-BR', {
								dateStyle: 'long',
								timeStyle: 'short',
							})}
						</time>
					</div>
				</div>

				<dl className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
					<Metric icon={<TimerIcon {...metricIconProps} />} label='Tempo' value={formatDuration(time)} />
					<Metric
						icon={<DirectionsRunIcon {...metricIconProps} />}
						label='Distância'
						value={formatDistance(stats.distance)}
					/>
					<Metric
						icon={<LocalFireDepartmentIcon {...metricIconProps} />}
						label='Calorias'
						value={formatCalories(stats.calories)}
					/>
					<Metric
						icon={<MonitorHeartIcon {...metricIconProps} />}
						label='Batimentos'
						value={formatHeartRate(stats.heartRate)}
					/>
					{stats.pace != null && (
						<Metric
							icon={<SpeedIcon {...metricIconProps} />}
							label='Ritmo'
							value={formatPace(stats.pace)}
						/>
					)}
					{stats.elevation != null && (
						<Metric
							icon={<TerrainIcon {...metricIconProps} />}
							label='Elevação'
							value={formatElevation(stats.elevation)}
						/>
					)}
				</dl>

				{/* Sem clamp: a página de detalhe existe justamente para o texto completo. */}
				<p className='mt-6 text-gray-700 leading-relaxed whitespace-pre-line'>{description}</p>
			</article>
		);
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header />

			<div className='md:flex'>
				<Sidebar />

				<main className='flex-1 p-4 md:p-6 pb-20 md:pb-6'>
					<div className='max-w-3xl mx-auto space-y-4'>
						<div className='max-w-[10rem]'>
							{/* `navigate(-1)` preserva os filtros do feed que ficaram na URL. */}
							<Button type='button' variant='secondary' onClick={() => navigate(-1)}>
								<ArrowBackIcon className='w-4 h-4 mr-2' aria-hidden='true' />
								Voltar
							</Button>
						</div>

						{renderContent()}
					</div>
				</main>
			</div>

			<BottomNavigation />
		</div>
	);
}

export default PostDetail;
