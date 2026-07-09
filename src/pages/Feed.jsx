import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import WorkoutCard from '../components/ui/WorkoutCard';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import ErrorMessage from '../components/ui/ErrorMessage';
import Dropdown from '../components/ui/Dropdown';
import Input from '../components/ui/Input';
import UiButton from '../components/ui/Button';
import { GET_FEED } from '../../database/graphql/query/feed';
import { DELETE_FEED_POST } from '../../database/graphql/mutation/feed';
import { CATEGORY_VALUES, WORKOUT_CATEGORIES } from '../constants/categories';
import { describeWorkout } from '../utils/workout';

const PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 350;

const CATEGORY_OPTIONS = [{ value: '', label: 'Todos' }, ...WORKOUT_CATEGORIES];

function Feed() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// A URL é a fonte da verdade do filtro: F5 preserva, voltar desfaz, e o link é
	// compartilhável. Um valor inválido em `?categoria=` degrada para "sem filtro".
	const categoryParam = searchParams.get('categoria') ?? '';
	const category = CATEGORY_VALUES.has(categoryParam) ? categoryParam : '';
	const search = (searchParams.get('busca') ?? '').trim();

	const [searchInput, setSearchInput] = useState(search);
	const [pagesLoaded, setPagesLoaded] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const [workoutToDelete, setWorkoutToDelete] = useState(null);
	const [feedback, setFeedback] = useState(null);

	const updateParams = (patch, { replace = false } = {}) => {
		setSearchParams(
			(previous) => {
				const next = new URLSearchParams(previous);
				for (const [key, value] of Object.entries(patch)) {
					if (value) next.set(key, value);
					else next.delete(key);
				}
				return next;
			},
			{ replace }
		);
	};

	// Voltar/avançar no navegador precisa refletir no campo de busca.
	useEffect(() => setSearchInput(search), [search]);

	// A busca escreve na URL com `replace` para não empilhar uma entrada de histórico
	// por tecla digitada. A categoria, sendo uma escolha deliberada, empilha.
	useEffect(() => {
		const trimmed = searchInput.trim();
		if (trimmed === search) return;

		const timer = setTimeout(() => updateParams({ busca: trimmed }, { replace: true }), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
		// `updateParams` é recriada a cada render; incluí-la reiniciaria o debounce
		// a cada render e a busca nunca dispararia.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput, search]);

	const filter = useMemo(() => {
		const next = {};
		if (category) next.category = category;
		if (search) next.q = search;
		return next;
	}, [category, search]);

	// Trocar de filtro recomeça a paginação; a query volta a pedir a página 0.
	useEffect(() => setPagesLoaded(0), [filter]);

	const { data, previousData, loading, error, fetchMore } = useQuery(GET_FEED, {
		variables: { filter, page: 0, perPage: PER_PAGE },
		fetchPolicy: 'cache-and-network',
	});

	// Enquanto a próxima resposta não chega, `data` é undefined. Segurar o resultado
	// anterior evita que a lista suma e a página pule de altura a cada troca de filtro.
	const current = data ?? previousData;
	const workouts = current?.allFeeds ?? [];
	const total = current?._allFeedsMeta?.count ?? 0;

	const isInitialLoading = loading && workouts.length === 0;
	const isRefreshing = loading && workouts.length > 0;
	const isEmpty = !loading && !error && workouts.length === 0;
	const hasMore = workouts.length < total;

	const [deleteFeedPost, { loading: deleting }] = useMutation(DELETE_FEED_POST, {
		// Sem refetch: refazer a lista inteira para remover um item é desperdício, e com
		// paginação seria errado — o refetch da página 0 não recompõe as já carregadas.
		update: (cache, { data: mutationData }) => {
			const deleted = mutationData?.deleteFeed;
			if (!deleted) return;

			cache.evict({ id: cache.identify(deleted) });
			cache.gc();

			// O total alimenta o "Carregar mais". Sem decrementar, `hasMore` continuaria
			// verdadeiro depois da última exclusão e o botão ficaria preso.
			// O decremento atinge todas as variações de filtro em cache, inclusive as que
			// não continham este post; elas se corrigem no próximo cache-and-network.
			cache.modify({
				fields: {
					_allFeedsMeta: (meta) =>
						typeof meta?.count === 'number' ? { ...meta, count: Math.max(0, meta.count - 1) } : meta,
				},
			});
		},
	});

	const handleLoadMore = async () => {
		// A página vem de um contador, não de `workouts.length`: uma exclusão encurta a
		// lista lida e faria o offset pular um item do servidor.
		const nextPage = pagesLoaded + 1;
		setLoadingMore(true);

		try {
			await fetchMore({ variables: { filter, page: nextPage, perPage: PER_PAGE } });
			setPagesLoaded(nextPage);
		} catch {
			setFeedback({ severity: 'error', message: 'Não foi possível carregar mais treinos.' });
		} finally {
			setLoadingMore(false);
		}
	};

	const confirmDelete = async () => {
		try {
			await deleteFeedPost({ variables: { id: workoutToDelete.id } });
			setFeedback({ severity: 'success', message: 'Postagem excluída.' });
		} catch {
			setFeedback({ severity: 'error', message: 'Não foi possível excluir a postagem.' });
		} finally {
			setWorkoutToDelete(null);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header />

			<div className='md:flex'>
				<Sidebar />

				<main className='flex-1 p-4 md:p-6 pb-20 md:pb-6'>
					<div className='max-w-7xl mx-auto'>
						<h1 className='text-2xl font-bold text-brand-graphite mb-6 hidden md:block'>
							Feed de Treinos
						</h1>

						{/* Uma linha de filtros acima de tudo que eles delimitam. */}
						<div className='grid gap-4 sm:grid-cols-2 mb-2'>
							<Input
								label='Buscar'
								type='search'
								placeholder='Busque por descrição'
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
							/>
							<Dropdown
								label='Categoria'
								options={CATEGORY_OPTIONS}
								value={category}
								onChange={(value) => updateParams({ categoria: value })}
								placeholder='Selecione uma categoria'
							/>
						</div>

						<p className='text-sm text-gray-500 mb-6' aria-live='polite'>
							{isInitialLoading
								? 'Carregando treinos...'
								: `${total} ${total === 1 ? 'treino' : 'treinos'}`}
						</p>

						{error && <ErrorMessage message='Erro ao carregar treinos' error={error.message} />}

						{isEmpty && (
							<div className='text-center py-16'>
								<p className='text-gray-600 font-medium'>
									{category || search
										? 'Nenhum treino encontrado.'
										: 'Nenhum treino publicado ainda.'}
								</p>
								<p className='text-sm text-gray-500 mt-1'>
									{category || search
										? 'Tente outros termos ou limpe os filtros.'
										: 'Publique o seu primeiro treino e comece o círculo.'}
								</p>
							</div>
						)}

						{!isInitialLoading && !error && workouts.length > 0 && (
							<>
								<ul
									// Uma lista de verdade: leitores de tela anunciam o total e permitem
									// navegar item a item. Antes era uma div de divs.
									className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 transition-opacity ${
										isRefreshing ? 'opacity-60' : ''
									}`}
								>
									{workouts.map((workout) => (
										<li key={workout.id}>
											<WorkoutCard
												workout={workout}
												onDelete={setWorkoutToDelete}
												onEdit={(target) => navigate(`/posts/${target.id}/edit`)}
											/>
										</li>
									))}
								</ul>

								{hasMore && (
									<div className='flex justify-center mt-8'>
										<div className='w-full max-w-xs'>
											<UiButton
												type='button'
												variant='secondary'
												onClick={handleLoadMore}
												disabled={loadingMore}
											>
												{loadingMore
													? 'Carregando...'
													: `Carregar mais (${total - workouts.length} restantes)`}
											</UiButton>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</main>
			</div>

			<BottomNavigation />

			<FloatingActionButton onClick={() => navigate('/posts/new')} />

			<Dialog open={workoutToDelete !== null} onClose={() => setWorkoutToDelete(null)}>
				<DialogTitle>Excluir postagem</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{/* Nomear o alvo: num grid de dezenas de cards, "esta postagem" não
						    diz o suficiente para confirmar uma ação irreversível. */}
						Excluir {workoutToDelete && describeWorkout(workoutToDelete)}? Essa ação não pode ser
						desfeita.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setWorkoutToDelete(null)} disabled={deleting}>
						Cancelar
					</Button>
					<Button onClick={confirmDelete} color='error' disabled={deleting} autoFocus>
						{deleting ? 'Excluindo...' : 'Excluir'}
					</Button>
				</DialogActions>
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

export default Feed;
