import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import ErrorMessage from '../components/ui/ErrorMessage';
import WorkoutCard from '../components/ui/WorkoutCard';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatTile from '../components/profile/StatTile';
import GoalMeter from '../components/profile/GoalMeter';
import GoalForm from '../components/forms/GoalForm';
import WeeklyDistanceChart from '../components/charts/WeeklyDistanceChart';
import PaceChart from '../components/charts/PaceChart';

import { GET_USER_PROFILE } from '../../database/graphql/query/user';
import { GET_USER_FEED } from '../../database/graphql/query/feed';
import { GET_USER_GOALS } from '../../database/graphql/query/goal';
import { CREATE_GOAL, DELETE_GOAL } from '../../database/graphql/mutation/goal';
import { useAuth } from '../hooks/useAuth';
import { summarize } from '../utils/stats';
import { formatDuration } from '../utils/format';

function Profile() {
	const { id: routeId } = useParams();
	const navigate = useNavigate();
	const { userId } = useAuth();

	// `/profile` não traz id na URL: o perfil é o do usuário logado.
	const profileId = routeId ?? userId;
	const isOwnProfile = profileId === userId;

	const [isGoalFormOpen, setGoalFormOpen] = useState(false);
	const [feedback, setFeedback] = useState(null);

	const {
		data: userData,
		loading: loadingUser,
		error: userError,
	} = useQuery(GET_USER_PROFILE, { variables: { id: profileId } });

	const {
		data: feedData,
		loading: loadingFeed,
		error: feedError,
	} = useQuery(GET_USER_FEED, {
		variables: { userId: profileId },
		fetchPolicy: 'cache-and-network',
	});

	// Metas são pessoais: não são carregadas nem exibidas no perfil de outra pessoa.
	const { data: goalsData } = useQuery(GET_USER_GOALS, {
		variables: { userId: profileId },
		skip: !isOwnProfile,
		fetchPolicy: 'cache-and-network',
	});

	const refetchGoals = [{ query: GET_USER_GOALS, variables: { userId: profileId } }];
	const [createGoal, { loading: creatingGoal }] = useMutation(CREATE_GOAL, {
		refetchQueries: refetchGoals,
	});
	const [deleteGoal] = useMutation(DELETE_GOAL, { refetchQueries: refetchGoals });

	const user = userData?.User;
	const workouts = feedData?.allFeeds ?? [];
	const goals = goalsData?.allGoals ?? [];
	const totals = summarize(workouts);

	const handleCreateGoal = async (goal) => {
		try {
			await createGoal({ variables: { ...goal, userId } });
			setGoalFormOpen(false);
			setFeedback({ severity: 'success', message: 'Meta criada.' });
		} catch (error) {
			setFeedback({ severity: 'error', message: error.message });
		}
	};

	const handleDeleteGoal = async (goal) => {
		try {
			await deleteGoal({ variables: { id: goal.id } });
			setFeedback({ severity: 'success', message: 'Meta excluída.' });
		} catch (error) {
			setFeedback({ severity: 'error', message: error.message });
		}
	};

	const renderContent = () => {
		if (loadingUser) {
			return <p className='text-center text-gray-500 py-12'>Carregando perfil...</p>;
		}

		if (userError) {
			return <ErrorMessage message='Erro ao carregar o perfil' error={userError.message} />;
		}

		if (!user) {
			return <ErrorMessage message='Usuário não encontrado' />;
		}

		return (
			<div className='space-y-6'>
				<ProfileHeader user={user} isOwnProfile={isOwnProfile} />

				{/* KPI row: números que são a própria resposta, não gráficos de uma barra. */}
				<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
					<StatTile label='Distância total' value={totals.totalDistance} unit='km' />
					<StatTile
						label='Neste mês'
						value={totals.distanceThisMonth}
						unit='km'
						hint={new Date().toLocaleDateString('pt-BR', { month: 'long' })}
					/>
					<StatTile label='Treinos' value={totals.totalWorkouts} />
					<StatTile
						label='Sequência ativa'
						value={totals.streak}
						unit={totals.streak === 1 ? 'dia' : 'dias'}
						hint={`Tempo total ${formatDuration(totals.totalTime)}`}
					/>
				</div>

				{isOwnProfile && (
					<section>
						<div className='flex items-center justify-between mb-3'>
							<h2 className='font-semibold text-brand-graphite'>Metas</h2>
							<button
								type='button'
								onClick={() => setGoalFormOpen(true)}
								className='flex items-center gap-1 text-sm font-semibold text-brand-graphite border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors'
							>
								<AddIcon className='w-4 h-4' aria-hidden='true' />
								Nova meta
							</button>
						</div>

						{goals.length === 0 ? (
							<div className='bg-white rounded-lg border border-gray-300 shadow-sm p-6 text-center'>
								<p className='text-gray-600 font-medium'>Nenhuma meta ativa.</p>
								<p className='text-sm text-gray-500 mt-1'>
									Defina uma distância e um prazo — seus treinos alimentam a barra sozinhos.
								</p>
							</div>
						) : (
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
								{goals.map((goal) => (
									<GoalMeter
										key={goal.id}
										goal={goal}
										workouts={workouts}
										onDelete={handleDeleteGoal}
									/>
								))}
							</div>
						)}
					</section>
				)}

				{feedError ? (
					<ErrorMessage message='Erro ao carregar os treinos' error={feedError.message} />
				) : (
					<>
						<div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
							<WeeklyDistanceChart workouts={workouts} />
							<PaceChart workouts={workouts} />
						</div>

						<section>
							<h2 className='font-semibold text-brand-graphite mb-3'>
								Histórico{workouts.length > 0 && ` (${workouts.length})`}
							</h2>

							{loadingFeed && workouts.length === 0 ? (
								<p className='text-center text-gray-500 py-8'>Carregando treinos...</p>
							) : workouts.length === 0 ? (
								<div className='bg-white rounded-lg border border-gray-300 shadow-sm p-6 text-center'>
									<p className='text-gray-600 font-medium'>Nenhum treino publicado.</p>
								</div>
							) : (
								<ul className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
									{workouts.map((workout) => (
										<li key={workout.id}>
											<WorkoutCard
												workout={workout}
												onEdit={
													isOwnProfile ? (target) => navigate(`/posts/${target.id}/edit`) : undefined
												}
											/>
										</li>
									))}
								</ul>
							)}
						</section>
					</>
				)}
			</div>
		);
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header />

			<div className='md:flex'>
				<Sidebar />

				<main className='flex-1 p-4 md:p-6 pb-20 md:pb-6'>
					<div className='max-w-7xl mx-auto'>{renderContent()}</div>
				</main>
			</div>

			<BottomNavigation />

			<Dialog open={isGoalFormOpen} onClose={() => setGoalFormOpen(false)} fullWidth maxWidth='sm'>
				<DialogTitle>Nova meta</DialogTitle>
				<DialogContent>
					<div className='pt-1'>
						<GoalForm
							onSubmit={handleCreateGoal}
							onCancel={() => setGoalFormOpen(false)}
							loading={creatingGoal}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<Snackbar
				open={feedback !== null}
				autoHideDuration={4000}
				onClose={() => setFeedback(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				{feedback ? (
					<Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
						{feedback.message}
					</Alert>
				) : undefined}
			</Snackbar>
		</div>
	);
}

export default Profile;
